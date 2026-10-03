'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Source = { text?: string; page?: number; source?: string; score?: number };

export default function Page() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    status,
    error,
  } = useChat({ api: '/api/chat' });
  const isBusy = status === 'streaming' || status === 'submitted';
  const suggestions = [
    'How is AI used in software testing?',
    'What are the risks of using GenAI?',
    'What are the benefits of using GenAI?',
    'What are the six components of a prompt?',
    'What are the key LLM capabilities for test tasks?',
    '20 study questions with answers',
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              role="img"
              aria-label="Friendly bear study partner logo"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-950"
            >
              <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="size-8">
                <circle cx="11" cy="11" r="7" fill="#78350f" />
                <circle cx="29" cy="11" r="7" fill="#78350f" />
                <circle cx="11" cy="11" r="3.5" fill="#fda4af" />
                <circle cx="29" cy="11" r="3.5" fill="#fda4af" />
                <path d="M7 20c0-8 5.8-13 13-13s13 5 13 13v5c0 7.2-5.8 11-13 11S7 32.2 7 25v-5Z" fill="#92400e" />
                <ellipse cx="20" cy="25" rx="8.5" ry="6.5" fill="#fef3c7" />
                <ellipse cx="20" cy="22.5" rx="2.5" ry="1.8" fill="#292524" />
                <path d="M17.5 27c1.3 1.8 3.7 1.8 5 0" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="13" cy="24" r="1.6" fill="#fb7185" opacity=".8" />
                <circle cx="27" cy="24" r="1.6" fill="#fb7185" opacity=".8" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">Rev.ai</h1>
              <p className="truncate text-xs text-slate-500">AI-powered study partner</p>
            </div>
          </div>
          <nav className="flex shrink-0 items-center gap-2">
            <a
              href="#about"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              About
            </a>
            <button
              type="button"
              onClick={() => setMessages([])}
              disabled={messages.length === 0 || isBusy}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              New chat
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl flex-col px-4 sm:px-6">
        <div className="flex-1 py-8 sm:py-12">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl pt-8 sm:pt-16">
              <p className="mb-3 text-sm font-medium text-cyan-800">YOUR STUDY COMPANION</p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Understand Generative AI, one question at a time.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Ask about the GenAI, explore key concepts, or review how GenAI fits into software testing.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void append({ role: 'user', content: suggestion })}
                    disabled={isBusy}
                    className="min-h-20 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-medium leading-5 text-slate-700 transition hover:border-cyan-700 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="mx-auto max-w-2xl space-y-8">
              {messages.map((m) => (
                <li key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-3'}>
                  {m.role === 'assistant' && (
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-700 text-xs font-bold text-white">
                      G
                    </div>
                  )}
                  <div className="min-w-0 max-w-[88%]">
                    {m.role === 'user' ? (
                      <div className="rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white">
                        {m.content}
                      </div>
                    ) : (
                      <div className="break-words pt-1 text-sm leading-7 text-slate-800 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:my-2 [&_h3]:font-semibold [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-200/70 [&_code]:px-1 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-cyan-800 [&_a]:underline [&_table]:my-2 [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    )}

                    {m.role === 'assistant' &&
                      !m.content.toLowerCase().includes("answer can't be found in my knowledge base") &&
                      m.toolInvocations?.map(
                        (inv) =>
                          inv.state === 'result' &&
                          inv.toolName === 'getInformation' && (
                            <details key={inv.toolCallId} className="mt-3 border-t border-slate-200 pt-3 text-sm">
                              <summary className="w-fit cursor-pointer font-medium text-cyan-800 hover:text-cyan-950">
                                Sources ({(inv.result as Source[]).length})
                              </summary>
                              <ul className="mt-3 space-y-3">
                                {(inv.result as Source[]).map((src, i) => (
                                  <li key={i} className="border-l-2 border-cyan-700 pl-3 text-slate-600">
                                    <span className="text-xs text-slate-500">
                                      {src.source ? `${src.source} · ` : ''}Page {src.page ?? '?'} · score{' '}
                                      {typeof src.score === 'number' ? src.score.toFixed(2) : '—'}
                                    </span>
                                    <p className="mt-1 text-sm leading-6">{src.text}</p>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ),
                      )}
                  </div>
                </li>
              ))}
              {isBusy && (
                <li className="flex items-center gap-3 text-sm text-slate-500" aria-live="polite">
                  <span className="grid size-8 place-items-center rounded-lg bg-cyan-100 text-xs font-bold text-cyan-900">G</span>
                  <span>{status === 'submitted' ? 'Thinking…' : 'Writing…'}</span>
                </li>
              )}
              {error && (
                <li role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  Something went wrong: {error.message}
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 pb-4 pt-3 backdrop-blur sm:-mx-6 sm:px-6">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-cyan-700 focus-within:ring-2 focus-within:ring-cyan-700/15">
            <label className="sr-only" htmlFor="chat-input">Ask a question about Generative AI</label>
            <textarea
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (input.trim() && !isBusy) void handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
              rows={1}
              className="max-h-32 min-h-11 flex-1 resize-y border-0 bg-transparent px-3 py-3 text-sm leading-5 outline-none placeholder:text-slate-400 focus:ring-0"
              placeholder="Ask a question about Generative AI..."
              disabled={isBusy}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isBusy}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-cyan-800 text-white transition hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-left text-xs leading-5 text-slate-500">
            <span className="block">This uses AI and it can make mistakes.</span>
          </p>
        </div>
      </section>

      <section id="about" className="scroll-mt-6 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 sm:grid-cols-[1fr_2fr] sm:px-6 sm:py-16">
          <div>
            <p className="text-sm font-semibold text-cyan-800">ABOUT REV.AI</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">A focused study partner</h2>
          </div>
          <div className="max-w-2xl space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Rev.ai is a RAG bot that helps you review Generative AI concepts and their use in software testing.
            </p>
            <p>
              The knowledge bases are curated reviewers based on the ISTQB Generative AI Syllabus v1.1.
            </p>
            <p>
              Answers are grounded in passages retrieved from the study guide. Expand the sources beneath an answer to see the supporting excerpts and page numbers. If the reviewer does not cover a question, the assistant may not be able to answer it.
            </p>
            <p>
              This is an independent study aid, not an official ISTQB® product. Refer to the official syllabus for authoritative material. ISTQB® reserves all rights to the syllabus content.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
