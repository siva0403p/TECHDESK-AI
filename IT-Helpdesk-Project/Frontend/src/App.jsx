import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect width="10" height="10" rx="2.5" fill="#2979ff"/>
              <rect x="12" width="10" height="10" rx="2.5" fill="#2979ff" opacity="0.4"/>
              <rect y="12" width="10" height="10" rx="2.5" fill="#2979ff" opacity="0.4"/>
              <rect x="12" y="12" width="10" height="10" rx="2.5" fill="#2979ff"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">TechDesk <span>AI</span></div>
            <div className="brand-tagline">IT Support System</div>
          </div>
        </div>

        <div className="topbar-center">
          <div className="topbar-status">
            <span className="status-dot" />
            <span className="status-text">All systems operational</span>
          </div>
        </div>

        <div className="topbar-right">
          <button
            className={`admin-toggle-btn ${adminOpen ? "active" : ""}`}
            onClick={() => setAdminOpen((v) => !v)}
          >
            🗂️ Admin Panel
            {adminOpen && <span className="admin-toggle-close">✕</span>}
          </button>
        </div>
      </header>

      {/* Chat — always centered, always full, never affected */}
      <main className="main">
        <ChatWindow />
      </main>

      {/* Admin — floats over the top as a drawer from right */}
      {adminOpen && (
        <>
          {/* Dark overlay behind panel */}
          <div
            className="admin-overlay"
            onClick={() => setAdminOpen(false)}
          />
          {/* Sliding panel */}
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">🗂️ Admin Panel</span>
              <button
                className="admin-drawer-close"
                onClick={() => setAdminOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-drawer-body">
              <AdminPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
