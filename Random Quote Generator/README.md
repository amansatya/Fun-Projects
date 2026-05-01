# Quote of the Day — MERN Stack Rebuild

A beautifully redesigned Random Quote Generator built with **Vite + React + Tailwind CSS v4** (frontend) and **Node.js + Express** (backend).

---

## Folder Structure

```
quote-app/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── QuoteCard.jsx   # Main card UI
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css           # Tailwind v4 + custom styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### Step 1 — Clone / Download

Place the `quote-app` folder wherever you want on your machine.

---

### Step 2 — Set Up the Backend

Open **PowerShell** and run:

```powershell
cd quote-app/backend
npm install
```

Start the backend server:
```powershell
npm run dev
```

You should see: `Quote API server running at http://localhost:5000`

---

### Step 3 — Set Up the Frontend

Open a **second PowerShell window** and run:

```powershell
cd quote-app/frontend
npm install
npm run dev
```

You should see Vite start at: `http://localhost:5173`

---

### Step 4 — Open in Browser

Visit: **http://localhost:5173**

The frontend proxies `/api/*` requests to the backend on port 5000 automatically via Vite's built-in proxy (configured in `vite.config.js`). No CORS issues, no extra setup needed.

---

## Features

- Random quotes from [DummyJSON](https://dummyjson.com/quotes) — **free, no API key needed**
- Fallback quotes if the API is down
- Text-to-speech (Web Speech API)
- Copy to clipboard with visual feedback
- Share on X / Twitter
- Smooth fade-in animation on every new quote
- Responsive — works on mobile and desktop
- Tailwind CSS v4 with `@theme` custom tokens

---

## Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React 19, Vite 6, Tailwind v4 |
| Backend    | Node.js, Express 4            |
| Quotes API | DummyJSON (1450+ quotes)      |
| Fonts      | Playfair Display + DM Sans    |

---

## Build for Production

```powershell
# Frontend
cd quote-app/frontend
npm run build        # outputs to dist/

# Backend — just deploy server.js with Node
cd quote-app/backend
npm start
```