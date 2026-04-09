import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  Download,
  Bot,
  User,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface DocumentAttachment {
  name: string;
  title: string;
  data: string; // base64-encoded PDF
}

interface DocumentDraft {
  type?: string;
  filename?: string;
  title: string;
  sections: { heading: string; body: string }[];
  signature_block?: string;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  document?: DocumentAttachment;
  documentDraft?: DocumentDraft;
  timestamp: Date;
}

const SUGGESTIONS = [
  "I want a Non-Disclosure Agreement PDF",
  "Generate a freelance service contract",
  "Create an employment offer letter",
  "I need a software license agreement",
];

function normalizeDraft(raw: unknown): DocumentDraft {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const sectionsRaw = o.sections;
  const sections = Array.isArray(sectionsRaw)
    ? sectionsRaw.map((s) => {
        const sec = s && typeof s === "object" ? (s as Record<string, unknown>) : {};
        return {
          heading: typeof sec.heading === "string" ? sec.heading : "",
          body: typeof sec.body === "string" ? sec.body : "",
        };
      })
    : [];
  return {
    type: typeof o.type === "string" ? o.type : undefined,
    filename: typeof o.filename === "string" ? o.filename : undefined,
    title: typeof o.title === "string" ? o.title : "Document",
    sections,
    signature_block:
      typeof o.signature_block === "string" ? o.signature_block : "",
  };
}

const AiGenerator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hello! I'm your AI Document Assistant.\n\nTell me which document you need. I'll draft the full text here—you can review and edit every section before you generate the final PDF.\n\nExamples:\n• Non-Disclosure Agreement (NDA)\n• Freelance / Service Contract\n• Employment Offer Letter\n• Software License Agreement\n\nWhat document can I create for you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoadingMsgId, setPdfLoadingMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pdfLoadingMsgId]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const updateDraftInMessage = (
    msgId: string,
    fn: (draft: DocumentDraft) => DocumentDraft
  ) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.documentDraft) return m;
        return { ...m, documentDraft: fn(m.documentDraft) };
      })
    );
  };

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    historyRef.current.push({ role: "user", content: msg });

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: historyRef.current.slice(-14),
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Request failed");

      historyRef.current.push({ role: "assistant", content: data.message });

      const draft = data.documentDraft
        ? normalizeDraft(data.documentDraft)
        : undefined;

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: data.message,
        documentDraft: draft,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "bot",
          content: `Sorry, I ran into an error: ${message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generatePdfFromDraft = async (msgId: string, draft: DocumentDraft) => {
    setPdfLoadingMsgId(msgId);
    try {
      const resp = await fetch("/api/ai/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: draft }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "PDF request failed");
      if (!data.document?.data) throw new Error("No PDF returned");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                document: data.document as DocumentAttachment,
              }
            : m
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "bot",
          content: `Could not generate PDF: ${message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setPdfLoadingMsgId(null);
    }
  };

  const downloadPDF = (doc: DocumentAttachment) => {
    const bytes = Uint8Array.from(atob(doc.data), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-0"
      style={{ height: "min(100dvh - 5rem, calc(100vh - 112px))" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
        <div className="bg-white/20 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg leading-tight">
            AI Document Assistant
          </h2>
          <p className="text-blue-100 text-xs">
            Generate professional legal &amp; business documents instantly
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                msg.role === "user"
                  ? "bg-blue-600"
                  : "bg-gradient-to-br from-indigo-500 to-blue-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            <div
              className={`flex flex-col gap-2 max-w-[min(100%,85vw)] sm:max-w-[76%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm shadow"
                    : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                }`}
              >
                {msg.content}
              </div>

              {/* Review & edit draft (before PDF) */}
              {msg.documentDraft && !msg.document && (
                <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm w-full max-w-lg space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Review &amp; edit before PDF
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Adjust the title, sections, or signature block.                       Use{" "}
                      <span className="font-medium text-gray-600">Add section</span>{" "}
                      for extra clauses, arrows to reorder, then generate your PDF.
                    </p>
                  </div>

                  <label className="block text-xs font-medium text-gray-600">
                    Document title
                    <input
                      type="text"
                      value={msg.documentDraft.title}
                      onChange={(e) =>
                        updateDraftInMessage(msg.id, (d) => ({
                          ...d,
                          title: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="block text-xs font-medium text-gray-600">
                    Filename (without .pdf)
                    <input
                      type="text"
                      value={
                        msg.documentDraft.filename?.replace(/\.pdf$/i, "") ?? ""
                      }
                      onChange={(e) =>
                        updateDraftInMessage(msg.id, (d) => ({
                          ...d,
                          filename: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. non-disclosure-agreement"
                    />
                  </label>

                  <div className="space-y-3 max-h-[min(50vh,360px)] overflow-y-auto pr-1">
                    {msg.documentDraft.sections.length === 0 && (
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        No sections yet. Add one below, or ask the assistant to
                        regenerate the document.
                      </p>
                    )}
                    {msg.documentDraft.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-lg p-3 bg-slate-50/80"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Section {idx + 1}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                updateDraftInMessage(msg.id, (d) => {
                                  if (idx === 0) return d;
                                  const next = [...d.sections];
                                  [next[idx - 1], next[idx]] = [
                                    next[idx],
                                    next[idx - 1],
                                  ];
                                  return { ...d, sections: next };
                                })
                              }
                              className="text-gray-500 hover:text-blue-700 disabled:opacity-25 disabled:hover:text-gray-500 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              title="Move section up"
                              aria-label={`Move section ${idx + 1} up`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={
                                idx >=
                                (msg.documentDraft?.sections.length ?? 0) - 1
                              }
                              onClick={() =>
                                updateDraftInMessage(msg.id, (d) => {
                                  if (idx >= d.sections.length - 1) return d;
                                  const next = [...d.sections];
                                  [next[idx], next[idx + 1]] = [
                                    next[idx + 1],
                                    next[idx],
                                  ];
                                  return { ...d, sections: next };
                                })
                              }
                              className="text-gray-500 hover:text-blue-700 disabled:opacity-25 disabled:hover:text-gray-500 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              title="Move section down"
                              aria-label={`Move section ${idx + 1} down`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraftInMessage(msg.id, (d) => ({
                                  ...d,
                                  sections: d.sections.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                              title="Remove section"
                              aria-label={`Remove section ${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Heading{" "}
                          <span className="font-normal text-gray-400">(optional)</span>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) =>
                              updateDraftInMessage(msg.id, (d) => ({
                                ...d,
                                sections: d.sections.map((s, i) =>
                                  i === idx
                                    ? { ...s, heading: e.target.value }
                                    : s
                                ),
                              }))
                            }
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </label>
                        <label className="block text-xs font-medium text-gray-600 mt-2">
                          Body
                          <textarea
                            value={sec.body}
                            onChange={(e) =>
                              updateDraftInMessage(msg.id, (d) => ({
                                ...d,
                                sections: d.sections.map((s, i) =>
                                  i === idx ? { ...s, body: e.target.value } : s
                                ),
                              }))
                            }
                            rows={6}
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-y min-h-[120px] leading-relaxed"
                          />
                        </label>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftInMessage(msg.id, (d) => ({
                          ...d,
                          sections: [
                            ...d.sections,
                            { heading: "", body: "" },
                          ],
                        }))
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add section
                    </button>
                  </div>

                  <label className="block text-xs font-medium text-gray-600">
                    Signature block
                    <textarea
                      value={msg.documentDraft.signature_block ?? ""}
                      onChange={(e) =>
                        updateDraftInMessage(msg.id, (d) => ({
                          ...d,
                          signature_block: e.target.value,
                        }))
                      }
                      rows={5}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] leading-relaxed font-mono text-xs"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={pdfLoadingMsgId === msg.id}
                    onClick={() =>
                      generatePdfFromDraft(msg.id, msg.documentDraft!)
                    }
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    {pdfLoadingMsgId === msg.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating PDF…
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate PDF
                      </>
                    )}
                  </button>
                </div>
              )}

              {msg.document && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-red-50 border border-red-100 p-2.5 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
                        {msg.document.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {msg.document.name} · PDF
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPDF(msg.document!)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}

              <span className="text-xs text-gray-400 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm border border-gray-100 flex items-center gap-1.5">
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "160ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "320ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 bg-slate-50 flex flex-wrap gap-2 flex-shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="Ask me to create a document… (e.g. 'I want an NDA PDF')"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 leading-relaxed"
            style={{ minHeight: "48px", maxHeight: "140px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white p-3 rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">Enter</kbd> to send &nbsp;·&nbsp;
          <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default AiGenerator;
