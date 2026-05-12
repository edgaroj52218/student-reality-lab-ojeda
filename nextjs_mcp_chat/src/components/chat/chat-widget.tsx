"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STARTER: Message = {
  id: "starter",
  role: "assistant",
  content:
    "Hi! I can answer questions about U.S. wage trends from 2010 to 2025. Try asking things like \"What happened to real wages in 2022?\" or \"Did wages keep up with inflation between 2018 and 2023?\"",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "Unable to get a response.");
      }

      setMessages((curr) => [
        ...curr,
        { id: crypto.randomUUID(), role: "assistant", content: payload.reply! },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open wage data chat"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 6px 30px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 24px rgba(0,0,0,0.18)";
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        style={{
          position: "fixed",
          bottom: "92px",
          right: "24px",
          width: "360px",
          maxHeight: "520px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 999,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            padding: "16px 20px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 6px #4ade80",
              }}
            />
            <span
              style={{
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "15px",
                letterSpacing: "0.01em",
                fontFamily: "'Georgia', serif",
              }}
            >
              Wage Data Assistant
            </span>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "11.5px",
              margin: "4px 0 0 18px",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            BLS data · 2010–2025 · MCP-powered
          </p>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "#f9f9f8",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius:
                    m.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                      : "#ffffff",
                  color: m.role === "user" ? "#ffffff" : "#1a1a1a",
                  fontSize: "13.5px",
                  lineHeight: "1.55",
                  boxShadow:
                    m.role === "user"
                      ? "none"
                      : "0 1px 4px rgba(0,0,0,0.07)",
                  border:
                    m.role === "assistant"
                      ? "1px solid rgba(0,0,0,0.06)"
                      : "none",
                  fontFamily:
                    m.role === "assistant"
                      ? "'Georgia', serif"
                      : "system-ui, sans-serif",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#aaa",
                      display: "inline-block",
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: "12px",
                color: "#dc2626",
                textAlign: "center",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            background: "#ffffff",
            display: "flex",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about wages..."
            disabled={isSending}
            autoComplete="off"
            style={{
              flex: 1,
              height: "38px",
              padding: "0 12px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "13px",
              fontFamily: "system-ui, sans-serif",
              outline: "none",
              background: "#f5f5f4",
              color: "#1a1a1a",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")
            }
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            style={{
              height: "38px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              opacity: !input.trim() || isSending ? 0.45 : 1,
              transition: "opacity 0.15s",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Send
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
