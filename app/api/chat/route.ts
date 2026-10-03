/**
 * Final Route Handler — Step 4 of Section 4 (RAG-as-tool-call) +
 * the source metadata used by Step 5's UI.
 *
 * The model decides whether to call the getInformation tool. When it does,
 * the tool runs vector search and returns chunk text + page + score. The
 * client renders those as collapsible sources under the assistant message.
 */
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, embed } from 'ai';
import { Index } from '@upstash/vector';
import { z } from 'zod';

const index = new Index();
const minimumRelevanceScore = 0.55;
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
});


export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system:
      'You are a study assistant whose only source of facts is the retrieved document content. ' +
      'Call getInformation for every user question. Answer only when the returned sources directly support the answer; do not use general knowledge, assumptions, or conversation history as evidence. ' +
      'If no relevant source is returned, or the sources do not contain the answer, reply exactly: "Answer can\'t be found in my knowledge base." ' +
      'Do not answer unrelated questions. Format supported answers using Markdown when helpful.',
    messages,
    tools: {
      getInformation: tool({
        description:
          'Look up information across the indexed PDF study documents. If the topic is not covered in the documents, do not respond.',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: query,
          });
          const hits = await index.query({
            vector: embedding,
            topK: 4,
            includeMetadata: true,
          });
          return hits
            .filter((h) => h.score >= minimumRelevanceScore)
            .map((h) => ({
              text: (h.metadata?.text as string) ?? '',
              page: (h.metadata?.page as number) ?? null,
              source: (h.metadata?.source as string) ?? null,
              score: h.score,
            }));
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}