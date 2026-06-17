import React, { useState, useEffect } from "react";

const ADMIN_PASSWORD = "admin123";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  }

  function handlePasswordKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  useEffect(() => {
    if (authenticated) fetchTickets();
  }, [authenticated]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch(
  "https://techdesk-ai.onrender.com/tickets" );
      const data = await res.json();
      setTickets(data);
    } catch {
      setTickets([]);
    }
    setLoading(false);
  }

  async function closeTicket(ticketId) {
    try {
      await fetch(
  "https://techdesk-ai.onrender.com/ticket/close",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket_id: ticketId }),
  }
);
      // Update locally
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId ? { ...t, status: "Closed" } : t
        )
      );
    } catch {
      // silently fail
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // Stats
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;
  const avgConfidence =
    total > 0
      ? (
          tickets.reduce((sum, t) => sum + (t.confidence || 0), 0) / total
        ).toFixed(2)
      : 0;

  // Filter + search + sort
  const filtered = tickets
    .filter((t) => filterStatus === "All" || t.status === filterStatus)
    .filter(
      (t) =>
        search === "" ||
        t.ticket_id?.toLowerCase().includes(search.toLowerCase()) ||
        t.query?.toLowerCase().includes(search.toLowerCase()) ||
        t.matched_question?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function getConfidenceColor(score) {
    if (score >= 0.8) return "#4ade80";
    if (score >= 0.5) return "#facc15";
    return "#f87171";
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  // ── Login Screen ──
  if (!authenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-icon">🔐</div>
          <h2 className="admin-login-title">Admin Access</h2>
          <p className="admin-login-sub">Enter password to view the ticket dashboard</p>

          <input
            type="password"
            className={`admin-password-input ${passwordError ? "error" : ""}`}
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={handlePasswordKeyDown}
            autoFocus
          />

          {passwordError && (
            <p className="admin-error">❌ Incorrect password. Try again.</p>
          )}

          <button className="admin-login-btn" onClick={handleLogin}>
            Login →
          </button>

          <p className="admin-hint">Hint: admin123</p>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="admin-panel">

      {/* Header */}
      <div className="admin-header">
        <div>
          <h2 className="admin-title">🗂️ Support Ticket Dashboard</h2>
          <p className="admin-subtitle">Manage and monitor all raised IT support tickets</p>
        </div>
        <button className="refresh-btn" onClick={fetchTickets}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Tickets</span>
        </div>
        <div className="stat-card open">
          <span className="stat-value" style={{ color: "#facc15" }}>{openCount}</span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat-card closed">
          <span className="stat-value" style={{ color: "#4ade80" }}>{closedCount}</span>
          <span className="stat-label">Closed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: "#7eb8ff" }}>
            {(avgConfidence * 100).toFixed(0)}%
          </span>
          <span className="stat-label">Avg AI Confidence</span>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="🔍 Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-btns">
          {["All", "Open", "Closed"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          {total === 0 ? "No tickets raised yet." : "No tickets match your filter."}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("ticket_id")} className="sortable">
                  Ticket ID <SortIcon field="ticket_id" />
                </th>
                <th onClick={() => handleSort("query")} className="sortable">
                  User Query <SortIcon field="query" />
                </th>
                <th onClick={() => handleSort("matched_question")} className="sortable">
                  Matched Issue <SortIcon field="matched_question" />
                </th>
                <th onClick={() => handleSort("confidence")} className="sortable">
                  Confidence <SortIcon field="confidence" />
                </th>
                <th onClick={() => handleSort("status")} className="sortable">
                  Status <SortIcon field="status" />
                </th>
                <th onClick={() => handleSort("timestamp")} className="sortable">
                  Timestamp <SortIcon field="timestamp" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket, i) => (
                <tr key={i} className={ticket.status === "Closed" ? "row-closed" : ""}>
                  <td>
                    <span className="ticket-id-cell">{ticket.ticket_id}</span>
                  </td>
                  <td className="query-cell">{ticket.query || "—"}</td>
                  <td className="matched-cell">{ticket.matched_question || "—"}</td>
                  <td>
                    <span
                      className="confidence-badge"
                      style={{ color: getConfidenceColor(ticket.confidence) }}
                    >
                      {ticket.confidence
                        ? `${(ticket.confidence * 100).toFixed(0)}%`
                        : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status === "Open" ? "open" : "closed"}`}>
                      {ticket.status === "Open" ? "● Open" : "✓ Closed"}
                    </span>
                  </td>
                  <td className="timestamp-cell">{ticket.timestamp || "—"}</td>
                  <td>
                    {ticket.status === "Open" ? (
                      <button
                        className="close-btn"
                        onClick={() => closeTicket(ticket.ticket_id)}
                      >
                        Close
                      </button>
                    ) : (
                      <span className="resolved-text">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-footer">
        Showing {filtered.length} of {total} tickets
      </div>
    </div>
  );
}
