# DeskFlow — Support Ticket Triage Board

MERN stack support ticket system with SLA tracking and Kanban board.

## Stack
- **Frontend:** React 18 + Vite + TailwindCSS + @hello-pangea/dnd → Netlify
- **Backend:** Node.js + Express + Mongoose → Render
- **Database:** MongoDB Atlas

## Live Links
- **Frontend (Netlify):** _(add after deploy)_
- **Backend (Render):** _(add after deploy)_
- **GitHub:** https://github.com/HARSHKDH/deskflow-support-tickets

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /tickets | Create ticket |
| GET | /tickets | List (filter: ?status, ?priority, ?breached=true) |
| GET | /tickets/stats | Aggregate stats |
| PATCH | /tickets/:id | Update status |
| DELETE | /tickets/:id | Delete ticket |

## Status Transitions
```
open → in_progress → resolved → closed
```
One step back allowed. Skipping steps is rejected with 400.

## SLA Targets
| Priority | Target |
|----------|--------|
| urgent   | 1 hour |
| high     | 4 hours |
| medium   | 24 hours |
| low      | 72 hours |

## Deploy Backend (Render)
1. Go to render.com → New → Web Service
2. Connect `deskflow-support-tickets` repo
3. Settings:
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Env Vars:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = `production`

## Deploy Frontend (Netlify)
1. Connect same repo to Netlify
2. Settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Env Var:
   - `VITE_API_URL` = your Render backend URL (no trailing slash)

## Local Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Create a `backend/.env` with:
```
MONGODB_URI=your_atlas_connection_string
PORT=5000
```
