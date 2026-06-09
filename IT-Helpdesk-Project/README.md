# 🖥️ TechDesk AI — IT Support HelpDesk Responder System

> An intelligent IT Helpdesk chatbot that automatically matches employee issues to known solutions, raises support tickets, and gives admins a real-time dashboard to manage all tickets.

---

## 📌 Project Overview

**TechDesk AI** is a full-stack IT support automation system built for internal company use. Employees can describe their technical problems in plain language, and the system instantly returns the best-matched solution from a knowledge base — along with a confidence score. If the issue remains unresolved, a support ticket is automatically raised for the IT team to follow up.

Admins get a separate password-protected dashboard to monitor all tickets, their statuses, AI confidence scores, and timestamps.

---

## 🚀 Features

### 💬 1. Conversational IT Chatbot
- Employees type their IT issue in natural language (e.g., *"outlook crashing"*)
- The AI assistant replies with a structured, step-by-step fix
- Each response card shows the matched solution and a **confidence score** (e.g., HIGH MATCH — 100%)
- Users can rate the response as helpful or not helpful using 👍 / 👎 buttons

### 🔍 2. Smart Search Suggestions (Autocomplete)
- As the user starts typing, a suggestion dropdown appears with related queries
- Examples shown: *"computer keeps crashing"*, *"outlook crashing"*, *"program crashing"*, *"phishing email"*
- Navigate with arrow keys, select with Tab, dismiss with Esc
- Speeds up issue reporting without needing to type the full problem

### 🎟️ 3. Automatic Support Ticket Creation
- A **"Raise Support Ticket"** button appears below every AI response
- On click, a ticket is instantly generated with a unique ID (e.g., `TKT-20260609-0020`)
- The ticket is marked as **Open** and includes the message: *"IT Support will contact you shortly"*
- Tickets are stored persistently and visible in the admin panel

### 🔐 4. Admin Panel (Password Protected)
- Accessible via the **"Admin Panel"** button in the top-right corner
- Protected by a password (hint shown on screen for demo: `admin123`)
- Only authorized personnel can access ticket data

### 📊 5. Support Ticket Dashboard
- Displays real-time stats:
  - **Total Tickets** raised
  - **Open** tickets count
  - **Closed** tickets count
  - **Average AI Confidence** across all tickets (e.g., 93%)
- Ticket table includes:
  - Ticket ID
  - User Query (what the employee typed)
  - Matched Issue (what the AI identified)
  - Confidence Score
  - Status (Open / Closed)
  - Timestamp
  - Action button (Close / Resolved)
- Filter tickets by **All / Open / Closed**
- Search bar to look up specific tickets
- **Refresh** button to reload the latest data

### 🟢 6. System Status Indicator
- Top-center header shows **"All systems operational"** with a green dot
- Gives employees quick confidence that the support system is live

---

## 🧠 How It Works

```
Employee types issue
        ↓
AI matches it against a knowledge base of common IT problems
        ↓
Returns best-matched solution + confidence score
        ↓
Employee can rate the answer OR raise a support ticket
        ↓
Ticket stored → Admin reviews via dashboard → Closes/Resolves

```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite  |
| Styling | Tailwind CSS / Custom dark theme |
| AI / Matching | Keyword-based or embedding-based issue matcher |
| State / Storage | Local state + persistent ticket store (JSON / localStorage) |
| Admin Auth | Simple password gate (configurable) |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/siva0403p/TECHDESK-AI.git
cd TECHDESK-AI

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Admin Access
Click **Admin Panel** (top right) → Enter password → View ticket dashboard.

---

## 📂 Project Structure

```
IT-HELPDESK-PROJECT/
│
├── 📁 Backend/                  ← Python Flask backend
│   ├── 📁 .venv/                ← Python virtual environment
│   ├── 🐍 app.py                ← Main Flask server (entry point)
│   ├── 📄 feedback_log.json     ← Stores 👍/👎 feedback from users
│   ├── 📄 knowledge_base.json   ← All IT issues + solutions stored here
│   ├── 🐍 models.py             ← AI matching logic / data models
│   ├── 📄 requirements.txt      ← Python dependencies (Flask, etc.)
│   └── 📄 tickets.json          ← All raised support tickets stored here
│
├── 📁 Frontend/                 ← React + Vite frontend
│   ├── 📁 node_modules/         ← npm packages
│   ├── 📁 src/                  ← All React components/code
│   ├── 🌐 index.html            ← HTML entry point
│   ├── 📄 package-lock.json
│   ├── 📄 package.json          ← Frontend dependencies
│   └── ⚡ vite.config.js        ← Vite configuration
│
├── 📁 .vscode/
│   └── tasks.json               ← VS Code task to run frontend with npm dev
└── 📄 package-lock.json

---

## 🎯 Use Cases

- Internal IT support for companies and colleges
- Reduce repetitive tickets for common issues (printer, Outlook, Excel, network)
- Give IT teams a clean dashboard instead of email chaos
- First-line automated support before escalating to a human

---

## 📈 Sample Tickets from Dashboard

| Issue | Confidence | Status |
|---|---|---|
| Outlook crashing | 100% | Open |
| Excel file not opening | 83% | Closed |
| Printer not printing | 100% | Open |
| Can't print to network printer | 84% | Closed |
| Excel file corrupted | 89% | Open |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 👨‍💻 Author

**Siva** — [@siva0403p](https://github.com/siva0403p)

> Built as a demo project showcasing AI-assisted IT support automation.
