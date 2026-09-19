# SupportDesk — Customer Support Ticketing CRM

A full-stack customer support ticketing system built for the Datastraw
assessment: create tickets, list/search/filter them, and view + update
a ticket's status and notes.

**Stack:** Node.js + Express (backend/API) · Supabase PostgreSQL (database) · Vanilla HTML/CSS/JS (frontend, served by Express).

---

## 1. Project structure

```
supportdesk-crm/
├── server.js            # Entry point — starts Express, wires everything together
├── db.js                # Initializes the Supabase database client
├── routes/
│   └── tickets.js       # The 4 REST endpoints (create/list/detail/update)
├── public/
│   └── index.html       # The entire frontend (HTML + CSS + JS, one file)
├── supabase_schema.sql  # SQL schema required to run in Supabase SQL editor
├── package.json
├── .env                 # Environment variables for your Supabase keys (you create this)
├── .env.example
└── .gitignore
```

**Why this shape:** one Express app serves both the API (`/api/tickets`)
and the frontend (`/`), from the same port. That means one deployed
URL, no CORS configuration, and no separate frontend hosting to manage
— simplest possible setup that still cleanly separates concerns
(`routes/` = API logic, `public/` = UI, `db.js` = data layer).

---

## 2. Database design

We use Supabase PostgreSQL. The two tables are:

**`tickets`**
| column | type | notes |
|---|---|---|
| id | BIGINT PK | autoincrement |
| ticket_id | TEXT UNIQUE | e.g. `TKT-001` |
| customer_name | TEXT | |
| customer_email | TEXT | |
| subject | TEXT | |
| description | TEXT | |
| status | TEXT | `Open` / `In Progress` / `Closed` |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

**`notes`**
| column | type | notes |
|---|---|---|
| id | BIGINT PK | autoincrement |
| ticket_id | TEXT | FK → tickets.ticket_id |
| note_text | TEXT | |
| created_at | TEXT | ISO timestamp |

---

## 3. API endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/tickets` | `{customer_name, customer_email, subject, description}` | `{ticket_id, created_at}` |
| GET | `/api/tickets?status=&search=` | — | array of ticket summaries |
| GET | `/api/tickets/:ticket_id` | — | full ticket + its notes |
| PUT | `/api/tickets/:ticket_id` | `{status?, notes?}` | `{success, updated_at}` |

`status` and `search` on the list endpoint are both optional query params.
`PUT` accepts `status`, `notes`, or both in one call — sending `notes`
appends a new note row rather than overwriting anything.

---

## 4. Supabase Setup

Since this project uses Supabase PostgreSQL as the database, you must configure a Supabase project before running.

1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase_schema.sql` from this codebase, copy its contents, and run it in the SQL Editor to create the tables.
4. Go to **Project Settings** -> **API** in Supabase.
5. Create a file named `.env` in the root of this project (copy `.env.example`).
6. Set `SUPABASE_URL` to your project URL.
7. Set `SUPABASE_SERVICE_ROLE_KEY` to your `service_role` secret key. **Do not put this key in any frontend code.**

---

## 5. Run it locally (no coding needed — just copy/paste these)

You need [Node.js](https://nodejs.org) installed (any version 18+).

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser. That's the whole
app — frontend and API both running from that one command.

---

## 6. Deploy it for free (Render.com — no credit card, ~5 minutes)

1. Push this project to a **GitHub repository** (see step 7 below if
   you haven't done that yet).
2. Go to [render.com](https://render.com) and sign up / log in with
   your GitHub account.
3. Click **New +** → **Web Service**.
4. Connect the GitHub repo you just pushed.
5. Fill in:
   - **Name:** `supportdesk-crm` (or anything)
   - **Region:** closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. **Important:** Under the "Environment Variables" section, click "Add Environment Variable" and add:
   - `SUPABASE_URL`: (your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY`: (your Supabase Service Role key)
7. Click **Create Web Service**. Render will build and deploy — takes
   2–4 minutes. When it's done you'll get a public URL like
   `https://supportdesk-crm.onrender.com` — that's your deployed app
   link for the submission.

---

## 7. Push to GitHub (step-by-step, no prior git experience assumed)

1. Create a new **empty** repository on [github.com](https://github.com/new)
   (don't add a README/license there — you already have one).
2. In a terminal, inside this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SupportDesk CRM"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. Refresh the GitHub page — your code should be there. The `.gitignore`
   already keeps `node_modules/` and `.env` out of
   the repo, so your database keys stay safe.

---

## 8. How to explain this in your demo video / interview

**Architecture, in one sentence:** "A browser loads the frontend from
Express, the frontend calls `fetch()` against 4 REST endpoints, and
those endpoints read/write a Supabase PostgreSQL database using the Supabase SDK."

**Walk through it in this order:**
1. `db.js` — Initializes the Supabase client using environment variables safely stored on the server.
2. `routes/tickets.js` — the 4 endpoints; point out `nextTicketId()`
   (auto-generates `TKT-001`, `TKT-002`, ...) and the `search` query
   using Supabase's `ilike` filter across multiple columns.
3. `server.js` — how one Express app serves both the static frontend
   and the JSON API from the same port.
4. `public/index.html` — the `api_createTicket` / `api_updateTicket`
   / `getTicketDetail` functions near the top of the `<script>` block;
   these are the *only* place the frontend talks to the network.

**Tradeoffs worth naming (this is exactly what the brief asks for):**
- Postgres over SQLite: Real database concurrency and robust types. Allows the application to run on ephemeral instances (like Render free tier) without losing data, since the database is externally hosted.
- API Route access: The Supabase SDK is used in a server-side trusted environment with a Service Role key, ensuring no database credentials are leaked to the client browser, which is much more secure for this monolithic approach.
