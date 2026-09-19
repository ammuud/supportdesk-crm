# ServiceHub CRM — Customer Support Ticketing CRM

A full-stack customer support ticketing system built for the Datastraw assessment: create tickets, list/search/filter them, and view + update a ticket's status and notes.

**Stack:** Node.js + Express (backend/API) · Supabase PostgreSQL (database) · Vanilla HTML/CSS/JS (frontend, served by Express)

---

## Live Demo

> **Deployed URL:** [PASTE MY ACTUAL RENDER URL HERE]

---

## Source Code

> **GitHub Repository:** [https://github.com/ammuud/supportdesk-crm](https://github.com/ammuud/supportdesk-crm)

---

## Features

- Create customer support tickets with auto-generated ticket IDs (`TKT-001`, `TKT-002`, …)
- Search tickets by customer name, ticket ID, email, subject, or description
- Filter tickets by status: **Open**, **In Progress**, and **Closed**
- View complete ticket details including all history and metadata
- Update ticket status from the ticket detail view
- Add timestamped internal notes to any ticket
- Responsive dashboard interface — works on desktop and mobile
- Built-in **ServiceHub Assistant** chatbot for instant answers to common CRM questions

---

## 1. Project Structure

```
supportdesk-crm/
├── server.js            # Entry point — starts Express, wires everything together
├── db.js                # Initializes the Supabase database client
├── routes/
│   └── tickets.js       # The 4 REST endpoints (create/list/detail/update)
├── public/
│   └── index.html       # The entire frontend (HTML + CSS + JS, one file)
├── supabase_schema.sql  # SQL schema to run in the Supabase SQL editor
├── package.json
├── .env.example         # Template — copy this to create your own .env
└── .gitignore
```

> **Note on `.env`:** A `.env` file is used locally to store your private Supabase credentials (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`). It is listed in `.gitignore` and is **not committed to GitHub**, keeping your database keys safe. On Render (and other hosting platforms), these values are set as environment variables in the dashboard instead.

**Why this shape:** One Express app serves both the API (`/api/tickets`) and the frontend (`/`) from the same port. That means one deployed URL, no CORS configuration, and no separate frontend hosting to manage — the simplest possible setup that still cleanly separates concerns (`routes/` = API logic, `public/` = UI, `db.js` = data layer).

---

## 2. Database Design

ServiceHub CRM uses Supabase PostgreSQL. The schema contains two tables:

### `tickets`

| Column           | Type        | Notes                             |
| ---------------- | ----------- | --------------------------------- |
| `id`             | BIGINT PK   | autoincrement                     |
| `ticket_id`      | TEXT UNIQUE | e.g. `TKT-001`                    |
| `customer_name`  | TEXT        |                                   |
| `customer_email` | TEXT        |                                   |
| `subject`        | TEXT        |                                   |
| `description`    | TEXT        |                                   |
| `status`         | TEXT        | `Open` / `In Progress` / `Closed` |
| `created_at`     | TEXT        | ISO timestamp                     |
| `updated_at`     | TEXT        | ISO timestamp                     |

### `notes`

| Column       | Type      | Notes                    |
| ------------ | --------- | ------------------------ |
| `id`         | BIGINT PK | autoincrement            |
| `ticket_id`  | TEXT      | FK → `tickets.ticket_id` |
| `note_text`  | TEXT      |                          |
| `created_at` | TEXT      | ISO timestamp            |

---

## 3. API Endpoints

| Method | Path                           | Request Body                                              | Response                    |
| ------ | ------------------------------ | --------------------------------------------------------- | --------------------------- |
| POST   | `/api/tickets`                 | `{ customer_name, customer_email, subject, description }` | `{ ticket_id, created_at }` |
| GET    | `/api/tickets?status=&search=` | —                                                         | Array of ticket summaries   |
| GET    | `/api/tickets/:ticket_id`      | —                                                         | Full ticket + notes array   |
| PUT    | `/api/tickets/:ticket_id`      | `{ status?, notes? }`                                     | `{ success, updated_at }`   |

- `status` and `search` on the list endpoint are both optional query parameters.
- `PUT` accepts `status`, `notes`, or both in a single call. Sending `notes` **appends** a new row to the `notes` table rather than overwriting existing notes.

---

## 4. Supabase Setup

ServiceHub CRM uses Supabase PostgreSQL as the database. You must configure a Supabase project before running locally.

1. Go to [supabase.com](https://supabase.com/) and create a free project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase_schema.sql` from this repository and run it in the SQL Editor to create the required tables.
4. Go to **Project Settings → API** in Supabase.
5. Copy `.env.example` to a new file named `.env` in the project root.
6. Set `SUPABASE_URL` to your Supabase project URL.
7. Set `SUPABASE_SERVICE_ROLE_KEY` to your `service_role` secret key.

> **Security:** The `SUPABASE_SERVICE_ROLE_KEY` is stored in a server-side environment variable and is **never exposed to frontend code or the browser**. All database operations go through the Express backend, which uses the Supabase SDK in a trusted server-side context.

---

## 5. Run Locally

You need [Node.js](https://nodejs.org) installed (version 18 or higher).

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Then open **http://localhost:3000** in your browser. Both the frontend and the API are served from that single command.

---

## 6. Deploy for Free on Render.com

> No credit card required — approximately 5 minutes end-to-end.

1. Push this project to a GitHub repository (see Section 7 if you haven't done this yet).
2. Go to [render.com](https://render.com) and sign up or log in with your GitHub account.
3. Click **New +** → **Web Service**.
4. Connect the GitHub repository you pushed.
5. Fill in the service settings:
   - **Name:** `servicehub-crm` (or any name you prefer)
   - **Region:** closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Under **Environment Variables**, add the following:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase Service Role key
7. Click **Create Web Service**. Render will build and deploy in 2–4 minutes. When complete, you will receive a public URL (e.g. `https://servicehub-crm.onrender.com`) — this is your submission link.

---

## 7. Push to GitHub

> Step-by-step — no prior Git experience assumed.

1. Create a new **empty** repository on [github.com/new](https://github.com/new). Do not initialise it with a README or licence — you already have one.
2. In a terminal, inside this project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: ServiceHub CRM"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. Refresh the GitHub page — your code should appear. The `.gitignore` already excludes `node_modules/` and `.env`, so your Supabase credentials are never committed.

---

## 8. Demo Video / Interview Walkthrough

**Architecture in one sentence:** "A browser loads the frontend from Express; the frontend calls `fetch()` against 4 REST endpoints; those endpoints read and write a Supabase PostgreSQL database using the Supabase SDK — all running from a single Node.js process."

### Recommended walkthrough order

1. **`db.js`** — Initialises the Supabase client using environment variables safely stored on the server. No credentials reach the browser.
2. **`routes/tickets.js`** — The 4 endpoints. Highlight `nextTicketId()` (auto-generates `TKT-001`, `TKT-002`, …) and the `search` query, which uses Supabase's `ilike` filter across multiple columns simultaneously.
3. **`server.js`** — Shows how a single Express app serves both the static frontend and the JSON API from the same port, eliminating any CORS complexity.
4. **`public/index.html`** — Point to the `api_createTicket`, `api_updateTicket`, and `getTicketDetail` functions in the `<script>` block. These are the **only** places the frontend communicates with the network.
5. **ServiceHub Assistant** — A built-in frontend-only chatbot (no external API, no API key) that answers common questions about using the CRM, demonstrating attention to user experience.

### Tradeoffs worth naming

- **Postgres over SQLite:** Real database concurrency and robust types. Because Supabase is externally hosted, the application state survives Render's ephemeral free-tier instances being spun down — no data loss between deployments.
- **Server-side SDK with Service Role key:** The Supabase SDK runs in a trusted server-side environment. No database credentials are ever exposed to the client browser, which is the correct security model for this monolithic Express architecture.
