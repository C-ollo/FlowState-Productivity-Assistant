"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { useChat } from "@/hooks/use-chat";

const SUGGESTIONS = [
  "What's due this week?",
  "Show my tasks",
  "What meetings do I have tomorrow?",
  "Give me a summary of my inbox",
];

export function AISidebar() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <aside className="w-80 border-l border-border-dark bg-background-dark hidden xl:flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">
            auto_awesome
          </span>
          <h3 className="text-sm font-bold">FlowState AI</h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-text-muted hover:text-white transition-colors"
            title="Clear chat"
          >
            <span className="material-symbols-outlined text-lg">
              delete_sweep
            </span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                auto_awesome
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-1">
                Ask me anything
              </p>
              <p className="text-xs text-text-muted">
                I can search your inbox, check deadlines, manage tasks, and
                create calendar events.
              </p>
            </div>
            <div className="w-full space-y-2 mt-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border-dark hover:border-primary/50 hover:bg-primary/5 text-text-muted hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-surface-dark border border-border-dark text-white rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-dark border border-border-dark rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border-dark">
        <div className="flex items-center gap-2 bg-surface-dark border border-border-dark rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FlowState AI..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-white placeholder-text-muted outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-primary hover:text-white disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
