"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

// quick prompts for the empty chat state
const QUICK_PROMPTS = [
  "how did you get into design?",
  "what are you building right now?",
  "tell me about your journey",
];

// transport for chat api
const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
});

export default function ChatAgent() {
  // ui state
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timestamps, setTimestamps] = useState<Record<string, Date>>({});

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // chat hook
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    onError: (error) => {
      console.error("chat error:", error);
      if (error.message?.includes("429")) {
        setRateLimited(true);
        setTimeout(() => setRateLimited(false), 30000);
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // send a message
  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      // track timestamp for this message before sending
      sendMessage({ text });
      setInputValue("");
      // reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    },
    [sendMessage, isLoading]
  );

  // track timestamps when new messages arrive
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!timestamps[lastMsg.id]) {
      setTimestamps((prev) => ({ ...prev, [lastMsg.id]: new Date() }));
    }
  }, [messages, timestamps]);

  // show bubble after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setBubbleVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // focus input when modal opens
  useEffect(() => {
    if (showContent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showContent]);

  // track typing state for gradient animation
  useEffect(() => {
    if (inputValue.length > 0) {
      setIsTyping(true);
    } else {
      const timer = setTimeout(() => setIsTyping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [inputValue]);

  // open modal with staggered animations
  const openModal = useCallback(() => {
    setIsOpen(true);
    setIsClosing(false);
    requestAnimationFrame(() => {
      setIsVisible(true);
      setTimeout(() => setShowContent(true), 300);
    });
  }, []);

  // close modal with exit animation
  const closeModal = useCallback(() => {
    setIsClosing(true);
    setShowContent(false);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 500);
    }, 200);
  }, []);

  // close on esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

  // handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      send(inputValue);
    },
    [send, inputValue]
  );

  // handle enter key (submit) and shift+enter (newline)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send(inputValue);
      }
    },
    [send, inputValue]
  );

  const hasMessages = messages.length > 0;

  // format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <>
      {/* floating chat bubble — morphs to pill on hover */}
      <button
        className={`chat-bubble ${bubbleVisible ? "visible" : ""} ${isOpen ? "hidden" : ""}`}
        onClick={openModal}
        aria-label="chat with clement"
        title="chat with clement"
      >
        <span className="chat-bubble-icon">
          <svg className="chat-bubble-svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <img
            className="chat-bubble-emoji"
            src="/clement-emoji.png"
            alt=""
          />
        </span>
        <span className="chat-bubble-label">ask me anything</span>
        {!isOpen && <span className="chat-bubble-pulse" />}
      </button>

      {/* full-screen chat modal */}
      {isOpen && (
        <div className="chat-modal-overlay" onClick={closeModal}>
          <div className={`chat-modal-panel ${isVisible ? "visible" : ""}`}>
            <div
              className={`chat-modal-content ${isClosing ? "closing" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* online indicator */}
              <div
                className={`chat-modal-status ${showContent ? "visible" : ""}`}
                style={{ transitionDelay: "0.4s" }}
              >
                <img
                  src="/clement-emoji.png"
                  alt=""
                  className="chat-modal-status-avatar"
                />
                <span className="chat-modal-status-dot" />
                <span className="chat-modal-status-label">
                  clement is online
                </span>
              </div>

              {/* chat area — centered container */}
              <div
                className={`chat-modal-chat-area ${showContent ? "visible" : ""} ${hasMessages ? "has-messages" : "empty-state"}`}
                style={{ transitionDelay: "0.45s" }}
              >
                {/* messages */}
                <div className="chat-modal-messages">
                  {!hasMessages && (
                    <div className="chat-modal-welcome">
                      <p className="chat-modal-welcome-text">
                      hey 👋🏽, clement here, ask me anything!
                      </p>
                      <div className="chat-modal-quick-prompts">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            className="chat-modal-quick-prompt"
                            onClick={() => send(prompt)}
                            disabled={isLoading}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-modal-message-group ${message.role}`}
                    >
                      {/* meta: name + time */}
                      <div className="chat-modal-message-meta">
                        {message.role === "assistant" && (
                          <>
                            <img
                              src="/clement-emoji.png"
                              alt=""
                              className="chat-modal-meta-avatar"
                            />
                            <span className="chat-modal-meta-name">clement</span>
                          </>
                        )}
                        {message.role === "user" && (
                          <span className="chat-modal-meta-name">you</span>
                        )}
                        <span className="chat-modal-meta-time">
                          {formatTime(timestamps[message.id] || new Date())}
                        </span>
                      </div>

                      {/* message bubble */}
                      <div className={`chat-modal-message ${message.role}`}>
                        <div className="chat-modal-message-bubble">
                          {message.parts?.map((part, i) =>
                            part.type === "text" ? (
                              <span key={i}>{part.text}</span>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* typing indicator */}
                  {isLoading &&
                    messages.length > 0 &&
                    messages[messages.length - 1].role === "user" && (
                      <div className="chat-modal-message-group assistant">
                        <div className="chat-modal-message-meta">
                          <img
                            src="/clement-emoji.png"
                            alt=""
                            className="chat-modal-meta-avatar"
                          />
                          <span className="chat-modal-meta-name">clement</span>
                        </div>
                        <div className="chat-modal-message assistant">
                          <div className="chat-modal-message-bubble">
                            <span className="chat-typing">
                              <span className="chat-typing-dot" />
                              <span className="chat-typing-dot" />
                              <span className="chat-typing-dot" />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>

                {/* input area */}
                <div className="chat-modal-input-container">
                  <form
                    onSubmit={handleSubmit}
                    className="chat-modal-input-area"
                  >
                    <div
                      className={`chat-modal-input-wrapper ${isTyping ? "typing" : ""}`}
                    >
                      {/* shimmer placeholder — visible only when input is empty */}
                      <span
                        className={`chat-modal-placeholder-shimmer ${inputValue ? "hidden" : ""}`}
                      >
                        ask me anything...
                      </span>
                      <textarea
                        ref={inputRef}
                        className="chat-modal-input"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          // auto-resize textarea height
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 140) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="ask me anything..."
                        rows={1}
                        disabled={rateLimited}
                      />
                      <button
                        type="submit"
                        className={`chat-modal-send ${inputValue.trim() && !isLoading && !rateLimited ? "active" : ""}`}
                        disabled={isLoading || !inputValue.trim() || rateLimited}
                        aria-label="send message"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="currentColor"
                          />
                          <path
                            d="M12 16V8M12 8l-3.5 3.5M12 8l3.5 3.5"
                            stroke="var(--chat-send-arrow, #1a1a1a)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                  <span className="chat-modal-esc-hint">
                    press <kbd>esc</kbd> to close chat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* close button */}
          <button
            className={`chat-modal-close ${showContent ? "visible" : ""} ${isClosing ? "closing" : ""}`}
            onClick={closeModal}
            aria-label="close chat"
            style={{ transitionDelay: "0.35s" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
