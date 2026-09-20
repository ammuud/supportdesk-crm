# ServiceHub CRM — Customer Support Ticketing CRM

A full-stack customer support ticketing system built for the Datastraw assessment: create tickets, list/search/filter them, and view + update a ticket's status and notes.

**Stack:** Node.js + Express (backend/API) · Supabase PostgreSQL (database) · Vanilla HTML/CSS/JS (frontend, served by Express)

\---

## Live Demo

> \*\*Deployed URL:\*\* \[https://servicehub-crm.onrender.com/](https://servicehub-crm.onrender.com/)---



## Source Code

> \*\*GitHub Repository:\*\* \[https://github.com/ammuud/supportdesk-crm](https://github.com/ammuud/supportdesk-crm)

\---

## Features

* Create customer support tickets with auto-generated ticket IDs (`TKT-001`, `TKT-002`, …)
* Search tickets by customer name, ticket ID, email, subject, or description
* Filter tickets by status: **Open**, **In Progress**, and **Closed**
* View complete ticket details including all history and metadata
* Update ticket status from the ticket detail view
* Add timestamped internal notes to any ticket
* Responsive dashboard interface — works on desktop and mobile
* Built-in **ServiceHub Assistant** chatbot for instant answers to common CRM questions

\---

## 1\. Project Structure

```
supportdesk-crm/
├── server.js            # Entry point — starts Express, wires everything together
├── db.js                # Initializes the Supabase database client
├── routes/
│   └── tickets.js       # The 4 REST endpoints (create/list/detail/update)
├── public/
│   └── index.html       # The entire frontend (HTML + CSS + JS, one file)
├── supabase\_schema.sql  # SQL schema to run in the Supabase SQL editor
├── package.json
├── .env.example         # Template — copy this to create your own .env
└── .gitignore
```

### \### Tradeoffs worth naming



\- \*\*Postgres over SQLite:\*\* Real database concurrency and robust types. Because Supabase is externally hosted, the application state survives Render's ephemeral free-tier instances being spun down — no data loss between deployments.

\- \*\*Server-side SDK with Service Role key:\*\* The Supabase SDK runs in a trusted server-side environment. No database credentials are ever exposed to the client browser, which is the correct security model for this monolithic Express architecture.---



## 2\. Database Design

ServiceHub CRM uses Supabase PostgreSQL. The schema contains two tables:

### `tickets`

|Column|Type|Notes|
|-|-|-|
|`id`|BIGINT PK|autoincrement|
|`ticket\_id`|TEXT UNIQUE|e.g. `TKT-001`|
|`customer\_name`|TEXT||
|`customer\_email`|TEXT||
|`subject`|TEXT||
|`description`|TEXT||
|`status`|TEXT|`Open` / `In Progress` / `Closed`|
|`created\_at`|TEXT|ISO timestamp|
|`updated\_at`|TEXT|ISO timestamp|

### `notes`

|Column|Type|Notes|
|-|-|-|
|`id`|BIGINT PK|autoincrement|
|`ticket\_id`|TEXT|FK → `tickets.ticket\_id`|
|`note\_text`|TEXT||
|`created\_at`|TEXT|ISO timestamp|

\---

## 3\. API Endpoints

|Method|Path|Request Body|Response|
|-|-|-|-|
|POST|`/api/tickets`|`{ customer\_name, customer\_email, subject, description }`|`{ ticket\_id, created\_at }`|
|GET|`/api/tickets?status=\&search=`|—|Array of ticket summaries|
|GET|`/api/tickets/:ticket\_id`|—|Full ticket + notes array|
|PUT|`/api/tickets/:ticket\_id`|`{ status?, notes? }`|`{ success, updated\_at }`|

* `status` and `search` on the list endpoint are both optional query parameters.
* `PUT` accepts `status`, `notes`, or both in a single call. Sending `notes` **appends** a new row to the `notes` table rather than overwriting existing notes.

\---

## 4\. Supabase Setup

ServiceHub CRM uses Supabase PostgreSQL as the database. You must configure a Supabase project before running locally.

1. Go to [supabase.com](https://supabase.com/) and create a free project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase\_schema.sql` from this repository and run it in the SQL Editor to create the required tables.
4. Go to **Project Settings → API** in Supabase.
5. Copy `.env.example` to a new file named `.env` in the project root.
6. Set `SUPABASE\_URL` to your Supabase project URL.
7. Set `SUPABASE\_SERVICE\_ROLE\_KEY` to your `service\_role` secret key.

> \*\*Security:\*\* The `SUPABASE\_SERVICE\_ROLE\_KEY` is stored in a server-side environment variable and is \*\*never exposed to frontend code or the browser\*\*. All database operations go through the Express backend, which uses the Supabase SDK in a trusted server-side context.

\---

## 5\. Run Locally

You need [Node.js](https://nodejs.org) installed (version 18 or higher).

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Then open **http://localhost:3000** in your browser. Both the frontend and the API are served from that single command.

\---

## 6\. Deploy for Free on Render.com

> No credit card required — approximately 5 minutes end-to-end.

1. Push this project to a GitHub repository (see Section 7 if you haven't done this yet).
2. Go to [render.com](https://render.com) and sign up or log in with your GitHub account.
3. Click **New +** → **Web Service**.
4. Connect the GitHub repository you pushed.
5. Fill in the service settings:

   * **Name:** `servicehub-crm` (or any name you prefer)
   * **Region:** closest to you
   * **Branch:** `main`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** Free
6. Under **Environment Variables**, add the following:

   * `SUPABASE\_URL` — your Supabase project URL
   * `SUPABASE\_SERVICE\_ROLE\_KEY` — your Supabase Service Role key
7. Click **Create Web Service**. Render will build and deploy in 2–4 minutes. When complete, you will receive a public URL (e.g. `https://servicehub-crm.onrender.com`) — this is your submission link.

\---

## 7\. Push to GitHub

> Step-by-step — no prior Git experience assumed.

1. Create a new **empty** repository on [github.com/new](https://github.com/new). Do not initialise it with a README or licence — you already have one.
2. In a terminal, inside this project folder:

```bash
   git init
   git add .
   git commit -m "Initial commit: ServiceHub CRM"
   git branch -M main
   git remote add origin https://github.com/YOUR\_USERNAME/YOUR\_REPO\_NAME.git
   git push -u origin main
   ```

3. Refresh the GitHub page — your code should appear. The `.gitignore` already excludes `node\_modules/` and `.env`, so your Supabase credentials are never committed.

\---

## 8\. Demo Video / Interview Walkthrough

### How the project works

The frontend is served by Express. The frontend sends requests to the ticket API, and the API reads and updates the data in Supabase.

### Recommended walkthrough order

1. **`db.js`** — Initialises the Supabase client using environment variables safely stored on the server. No credentials reach the browser.
2. **`routes/tickets.js`** — The 4 endpoints. Highlight `nextTicketId()` (auto-generates `TKT-001`, `TKT-002`, …) and the `search` query, which uses Supabase's `ilike` filter across multiple columns simultaneously.
3. **`server.js`** — Shows how a single Express app serves both the static frontend and the JSON API from the same port, eliminating any CORS complexity.
4. **`public/index.html`** — Point to the `api\_createTicket`, `api\_updateTicket`, and `getTicketDetail` functions in the `<script>` block. These are the **only** places the frontend communicates with the network.
5. **ServiceHub Assistant** — A built-in frontend-only chatbot (no external API, no API key) that answers common questions about using the CRM, demonstrating attention to user experience.

### Technology choice

* ### Why Supabase

I used Supabase PostgreSQL as the database. It stores the project data online, so the data does not depend on the server running locally.

* **Server-side SDK with Service Role key:** The Supabase SDK runs in a trusted server-side environment. No database credentials are ever exposed to the client browser, which is the correct security model for this monolithic Express architecture.

