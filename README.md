# Week 14A · Next.js RAG Graded Assignment

For this assignment I created 2 GenAI reviewer (pdf file): CT-GenAI_Study Guide.pdf and GenAI_Testing_Reviewer_CT-GenAI_v1.1.pdf using Claude. These documents are based on ISTQB Gen AI syllabus.
This is an independent study aid, not an official ISTQB® product. Refer to the official syllabus for authoritative material. ISTQB® reserves all rights to the syllabus content.
https://istqb.org/?sdm_process_download=1&download_id=6295




# Week 14A · Next.js RAG starter

A streaming chat app on top of your knowledge base, built with [Next.js 15](https://nextjs.org/), the [Vercel AI SDK](https://sdk.vercel.ai/), and [Upstash Vector](https://upstash.com/docs/vector). This is the working solution for Section 4 of Week 14A.

## What's here

```
14A-nextjs-rag/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          # FINAL UI — useChat + sources
│   └── api/chat/route.ts                 # FINAL handler — RAG-as-tool-call
├── lib/
│   └── seed.ts                           # Embeds data/sample.pdf into Upstash
├── data/
│   └── sample.pdf                        # Synthetic Acme Widget Spec
├── steps/                                # Reference snapshots per workshop step
│   ├── step2-plain-chat/
│   │   ├── page.tsx                      # Step 2: useChat client component
│   │   └── route.ts                      # Step 2: vanilla streamText handler
│   ├── step4-rag-as-tool/
│   │   └── route.ts                      # Step 4: route handler with the tool
│   └── step5-sources/
│       └── page.tsx                      # Step 5: page with <details> sources
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── .env.example
├── .gitignore
└── README.md
```



## Setup (5 minutes)

```bash
# 1. install
npm install

# 2. environment
cp .env.example .env.local
# edit .env.local and paste your Vocareum OPENAI_API_KEY,
# OPENAI_API_BASE_URL, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN

# 3. place one or more PDF files in data/, then seed the vector index
npm run seed
```

The seed script reads every `*.pdf` file in `data/`, chunks and embeds each page with `text-embedding-3-small`, and indexes the results in Upstash Vector. Re-run it whenever you add, replace, rename, or remove a PDF; each run replaces the app's previous seeded chunks. Source results include the PDF filename and page number.

## Run the final app

```bash
npm run dev
# open http://localhost:3000
```

Try asking:

- *"What auth methods does the API support?"*
- *"What happens when I exceed the rate limit?"*
- *"Compare OAuth2 and API key authentication."*

You should see tokens stream into the assistant bubble, then a **Sources (N)** disclosure beneath it. Expanding it shows page numbers, similarity scores, and the chunk text the model retrieved.

## Walk through the steps

The `/steps` folder contains reference snapshots. To try them, copy each file over the matching path in `app/`:


| Step | Files to copy                                                | What it shows                              |
| ---- | ------------------------------------------------------------ | ------------------------------------------ |
| 2    | `steps/step2-plain-chat/page.tsx` → `app/page.tsx`           | useChat working against vanilla streamText |
|      | `steps/step2-plain-chat/route.ts` → `app/api/chat/route.ts`  | (no RAG yet — verify streaming first)      |
| 4    | `steps/step4-rag-as-tool/route.ts` → `app/api/chat/route.ts` | The model decides when to call retrieval   |
| 5    | `steps/step5-sources/page.tsx` → `app/page.tsx`              | Sources rendered below answers             |


After Step 5, the snapshots and the final `app/page.tsx` + `app/api/chat/route.ts` are the same shape — the final versions add a small system prompt and some chrome (a header, slightly nicer styling, status / error rendering).

## Use your own corpus

1. Add, replace, or remove PDF files in `data/` (multiple PDFs are supported).
2. Re-run `npm run seed` to rebuild the indexed corpus.
3. Restart `npm run dev`.

For multi-PDF, multi-version, or permission-aware retrieval see Week 14B Section 4.

## Deploy to Vercel

```bash
npm i -g vercel  # if you don't have it
vercel           # first run: log in, link the project
vercel link
vercel env add OPENAI_API_KEY
vercel env add OPENAI_API_BASE_URL
vercel env add UPSTASH_VECTOR_REST_URL
vercel env add UPSTASH_VECTOR_REST_TOKEN
vercel --prod
```

You'll get a public URL like `https://rag-ui-xxx.vercel.app`. The seed is local — you only need to seed once per index, regardless of where the chat app is hosted.

## Common errors


| Symptom                                            | Fix                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `Error: missing UPSTASH_VECTOR_REST_URL`           | Run `npm run seed` after setting `.env.local`. Verify in Upstash.  |
| Page renders but submitting hangs                  | Route handler missing `toDataStreamResponse()`. Check `route.ts`.  |
| Empty / very short answer after a tool call        | `maxSteps` not set or set to 1. Set `maxSteps: 3` on `streamText`. |
| `Cannot use useChat in a Server Component`         | Forgot `'use client'` at the top of `page.tsx`.                    |
| Build error: `Type '...' is not assignable to ...` | Run `npx tsc --noEmit` to see the full type error.                 |
| `vercel --prod` build fails on missing env vars    | `vercel env add ...` and pick **Production** when prompted.        |


