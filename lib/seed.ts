/**
 * Seed Upstash Vector with chunks from every PDF in data/.
 *
 * Run once before starting the chat:
 *   npm run seed
 *
 * Re-run any time you add or replace a PDF in data/.
 * Chunk IDs are deterministic per filename and chunk position.
 */
import { config as loadEnv } from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

// Next.js reads .env.local automatically; this script does not.
loadEnv({ path: path.join(process.cwd(), '.env.local') });
import { Index } from '@upstash/vector';
import { embedMany } from 'ai';
// pdf-parse uses CommonJS; default-import the parser fn
import pdfParse from 'pdf-parse';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

type Chunk = { text: string; page: number; source: string };

/**
 * Naive but adequate chunker: split text into ~800-char windows with 100-char
 * overlap, attempting to break on sentence boundaries when possible.
 * I have updated the CHUNK_SIZE to 1000 and CHUNK_OVERLAP to 100 to better suit the document's content and ensure that the chunks are of a manageable size for embedding and retrieval.
 */
function chunkText(text: string, page: number, source: string): Chunk[] {
  const out: Chunk[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(text.length, i + CHUNK_SIZE);
    // Try to extend to the next sentence boundary if we're not at the end.
    if (end < text.length) {
      const lookahead = text.slice(end, end + 200);
      const m = lookahead.match(/[.!?]\s/);
      if (m && m.index !== undefined) end += m.index + 1;
    }
    const piece = text.slice(i, end).trim();
    if (piece.length > 0) out.push({ text: piece, page, source });
    if (end >= text.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return out;
}

async function loadAndChunkPdf(filePath: string): Promise<Chunk[]> {
  const buf = await fs.readFile(filePath);
  const parsed = await pdfParse(buf, {
    pagerender: async (pageData) => {
      const content = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });
      let lastY: number | undefined;
      let text = '';
      for (const item of content.items) {
        if (lastY === item.transform[5] || lastY === undefined) {
          text += item.str;
        } else {
          text += `\n${item.str}`;
        }
        lastY = item.transform[5];
      }
      return `${text}\f`;
    },
  });
  const pages = parsed.text.split('\f');
  const chunks: Chunk[] = [];
  pages.forEach((pageText, pageIdx) => {
    if (pageText.trim().length === 0) return;
    chunks.push(...chunkText(pageText.trim(), pageIdx + 1, path.basename(filePath)));
  });
  return chunks;
}

async function main() {
  const { openai } = await import('./openai');

  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error('Missing UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN. Set them in .env.local.');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in .env.local.');
    process.exit(1);
  }

  const pdfFiles = (await fs.readdir(DATA_DIR))
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort();
  if (pdfFiles.length === 0) {
    throw new Error(`No PDF files found in ${DATA_DIR}`);
  }

  const chunks: Chunk[] = [];
  for (const file of pdfFiles) {
    const fileChunks = await loadAndChunkPdf(path.join(DATA_DIR, file));
    console.log(`  ${file}: ${fileChunks.length} chunks across ${new Set(fileChunks.map((chunk) => chunk.page)).size} page(s)`);
    chunks.push(...fileChunks);
  }
  console.log(`Loaded ${pdfFiles.length} PDF(s), ${chunks.length} chunks total.`);

  console.log('Embedding…');
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks.map((c) => c.text),
  });

  const index = new Index();
  const fileChunkIndices = new Map<string, number>();
  const records = chunks.map((c, i) => {
    const sourceKey = encodeURIComponent(c.source);
    const chunkIndex = fileChunkIndices.get(sourceKey) ?? 0;
    fileChunkIndices.set(sourceKey, chunkIndex + 1);
    return {
      id: `pdf_${sourceKey}_chunk_${chunkIndex}`,
      vector: embeddings[i],
      metadata: { text: c.text, page: c.page, source: c.source },
    };
  });

  await index.delete({ prefix: 'chunk_' });
  await index.delete({ prefix: 'pdf_' });

  console.log(`Upserting ${records.length} chunks to Upstash Vector…`);
  // Upstash supports up to 1000 vectors per upsert; chunk if needed.
  const BATCH = 100;
  for (let i = 0; i < records.length; i += BATCH) {
    await index.upsert(records.slice(i, i + BATCH));
  }
  console.log('✅ Done. Run `npm run dev` and chat at http://localhost:3000');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
