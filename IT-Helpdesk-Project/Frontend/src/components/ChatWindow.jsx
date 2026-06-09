import React, { useEffect, useRef, useState, useCallback } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      who: "bot",
      text: "Hello! I'm your IT Helpdesk Assistant.\nDescribe your issue and I'll find the best solution for you.",
    },
  ]);

  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((value) => {
    clearTimeout(debounceTimer.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/suggest?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
  }, []);

  function handleInputChange(value) {
    setQuery(value);
    fetchSuggestions(value);
  }

  function selectSuggestion(item) {
    setQuery(item);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage() {
    const text = query.trim();
    if (!text) return;

    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setMessages((prev) => [...prev, { who: "user", text }]);
    setQuery("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      const fullText = data.response || "No response from server.";
      const confidence = data.confidence ?? 0;

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            who: "bot",
            text: "",
            confidence,
            matched_question: data.matched_question,
            original_query: text,
            feedbackSent: false,
            feedbackType: null,
            ticketRaised: false,
            ticketId: null,
          },
        ]);

        let index = 0;
        let currentText = "";
        const interval = setInterval(() => {
          currentText += fullText[index];
          index++;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: currentText,
            };
            return updated;
          });
          if (index >= fullText.length) clearInterval(interval);
        }, 8);
      }, 800);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          who: "bot",
          text: "⚠️ Error contacting backend. Please make sure the server is running.",
          confidence: 0,
        },
      ]);
    }
  }

  async function sendFeedback(msgIndex, type) {
    const msg = messages[msgIndex];
    try {
      await fetch("http://127.0.0.1:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg.original_query,
          matched_question: msg.matched_question,
          confidence: msg.confidence,
          feedback: type,
        }),
      });
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, feedbackSent: true, feedbackType: type } : m
        )
      );
    } catch {
      // silently fail
    }
  }

  // ✅ FIXED: raiseTicket is BEFORE return — not after
  async function raiseTicket(msgIndex) {
    const msg = messages[msgIndex];
    try {
      const res = await fetch("http://127.0.0.1:5000/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg.original_query,
          matched_question: msg.matched_question,
          confidence: msg.confidence,
        }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex
            ? { ...m, ticketRaised: true, ticketId: data.ticket_id }
            : m
        )
      );
    } catch {
      // silently fail
    }
  }

  function getConfidenceColor(score) {
    if (score >= 0.8) return "#4ade80";
    if (score >= 0.5) return "#facc15";
    return "#f87171";
  }

  function getConfidenceLabel(score) {
    if (score >= 0.8) return "High Match";
    if (score >= 0.5) return "Possible Match";
    return "Low Match";
  }

  // ✅ return is LAST — all functions defined above
  return (
    <div className="chatbox">
      <div className="history" ref={historyRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.who}`}>
            {msg.who === "bot" && <div className="avatar bot-avatar">🤖</div>}

            <div className="message-content">
              <div className={`bubble ${msg.who}`}>

                {/* Message Text */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: escapeHtml(msg.text).replace(/\n/g, "<br/>"),
                  }}
                />

                {/* ── Confidence Bar ── */}
                {msg.who === "bot" && msg.confidence > 0 && (
                  <div className="confidence-block">
                    <div className="confidence-row">
                      <span
                        className="confidence-label"
                        style={{ color: getConfidenceColor(msg.confidence) }}
                      >
                        🎯 {getConfidenceLabel(msg.confidence)}
                      </span>
                      <span
                        className="confidence-percent"
                        style={{ color: getConfidenceColor(msg.confidence) }}
                      >
                        {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="confidence-track">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${(msg.confidence * 100).toFixed(0)}%`,
                          background: getConfidenceColor(msg.confidence),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ── Feedback Buttons ── */}
                {msg.who === "bot" && msg.matched_question && (
                  <div className="feedback-area">
                    {msg.feedbackSent ? (
                      <span className="feedback-done">
                        {msg.feedbackType === "positive"
                          ? "✅ Thanks for the positive feedback!"
                          : "📝 Thanks — we'll improve this answer."}
                      </span>
                    ) : (
                      <>
                        <span className="feedback-label">Was this helpful?</span>
                        <button
                          className="feedback-btn positive"
                          onClick={() => sendFeedback(i, "positive")}
                        >👍</button>
                        <button
                          className="feedback-btn negative"
                          onClick={() => sendFeedback(i, "negative")}
                        >👎</button>
                      </>
                    )}
                  </div>
                )}

                {/* ── Ticket Section ── */}
                {msg.who === "bot" && msg.matched_question && (
                  <div className="ticket-area">
                    {msg.ticketRaised ? (
                      <div className="ticket-card">
                        <div className="ticket-card-top">
                          <span className="ticket-icon">🎫</span>
                          <span className="ticket-raised-label">Support Ticket Raised</span>
                        </div>
                        <div className="ticket-info">
                          <span className="ticket-id">{msg.ticketId}</span>
                          <span className="ticket-status">● Open</span>
                        </div>
                        <span className="ticket-label">IT Support will contact you shortly</span>
                      </div>
                    ) : (
                      <button
                        className="ticket-btn"
                        onClick={() => raiseTicket(i)}
                      >
                        🎫 Raise Support Ticket
                      </button>
                    )}
                  </div>
                )}

              </div>{/* end bubble */}

              <div className="meta">
                {msg.who === "user" ? "You" : "IT Assistant"}
              </div>
            </div>

            {msg.who === "user" && <div className="avatar user-avatar">👤</div>}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message-row bot">
            <div className="avatar bot-avatar">🤖</div>
            <div className="message-content">
              <div className="bubble bot typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input + Suggestions */}
      <div className="composer-wrapper">
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown" ref={suggestionsRef}>
            <div className="suggestions-header">
              <span>💡 Suggestions</span>
              <span className="suggestions-hint-keys">↑↓ navigate · Tab select · Esc close</span>
            </div>
            {suggestions.map((item, index) => (
              <div
                key={index}
                className={`suggestion-item ${index === selectedIndex ? "selected" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(item);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-text">{item}</span>
                {index === selectedIndex && (
                  <span className="suggestion-enter">↵</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="composer">
          <textarea
            ref={inputRef}
            className="input"
            rows="1"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your IT issue... (Enter to send)"
          />
          <button className="btn" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
