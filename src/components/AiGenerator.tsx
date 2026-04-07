import React, { useState, useRef, useEffect } from "react";
import { Send, FileText, Download, Bot, User, Sparkles } from "lucide-react";

interface DocumentAttachment {
  name: string;
  title: string;
  data: string; // base64-encoded PDF
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  document?: DocumentAttachment;
  timestamp: Date;
}

const SUGGESTIONS = [
  "I want a Non-Disclosure Agreement PDF",
  "Generate a freelance service contract",
  "Create an employment offer letter",
  "I need a software license agreement",
];

const AiGenerator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hello! I'm your AI Document Assistant.\n\nTell me which document you need and I'll generate a professional, ready-to-use PDF for you. For example:\n• Non-Disclosure Agreement (NDA)\n• Freelance / Service Contract\n• Employment Offer Letter\n• Software License Agreement\n\nWhat document can I create for you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
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

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: data.message,
        document: data.document ?? undefined,
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
            {/* Avatar */}
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

            {/* Bubble + doc card */}
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

              {/* PDF Download Card */}
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

        {/* Typing indicator */}
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

      {/* ── Suggestion chips (only when no conversation yet) ── */}
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

      {/* ── Input bar ── */}
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
