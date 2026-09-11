# PixelTerritory — Real-time Shared Grid

A production-style collaborative pixel board where multiple users claim cells on a shared 50×50 grid in real time. The project is split into two independent applications:

- **`backend/`** — Node.js, Express, MongoDB, Socket.IO
- **`frontend/`** — Next.js 16, React, Tailwind CSS

## Architecture

```
┌─────────────┐      REST (initial load)      ┌─────────────┐
│   Next.js   │ ───────────────────────────► │   Express   │
│   Frontend  │                              │   Backend   │
│             │ ◄─────────────────────────── │             │
└─────────────┘      WebSocket (live sync)   └──────┬──────┘
       │                                            │
       │                                            ▼
       │                                     ┌─────────────┐
       └──────── Socket.IO events ────────► │   MongoDB   │
                                             └─────────────┘
```

### Why this split?

- **REST** loads the full grid state and handles user registration reliably over HTTP.
- **Socket.IO** pushes incremental cell updates to every connected client without polling.
- **MongoDB atomic updates** guarantee only one user wins when two clients claim the same cell.

## Real-time update flow

1. User clicks an empty cell in the frontend.
2. Client emits `claim_cell` over Socket.IO (REST fallback if socket is disconnected).
3. Backend validates coordinates, user identity, and cooldown.
4. Backend runs an atomic `findOneAndUpdate()` with condition `owner: null`.
5. On success, backend emits `cell_updated` to all clients via `io.emit()`.
6. Each client patches only the affected cell in local state and plays a brief animation.

### Socket events

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client → Server | `user_join` | Register presence and username |
| Client → Server | `claim_cell` | Attempt to claim a cell |
| Server → Clients | `cell_updated` | Broadcast cell ownership change |
| Server → Clients | `online_users` | Active user count and list |
| Server → Clients | `activity` | Live activity feed entries |
| Server → Clients | `user_event` | Join/leave notifications |

## Race condition handling

Concurrent claims on the same cell are resolved with MongoDB atomic conditional updates:

```javascript
Cell.findOneAndUpdate(
  { row, column, owner: null },
  { $set: { owner, color, updatedAt } },
  { new: true }
);
```

- The **first** update that matches `owner: null` succeeds.
- Later requests find no matching document and receive `{ success: false, message: "Cell already claimed" }`.
- No application-level locks are required; MongoDB guarantees atomicity at the document level.

## Features

- 50×50 grid (2,500 cells), configurable via env vars
- Username registration with unique identity
- Color picker for claimed cells
- Real-time sync across all connected clients
- 5-second claim cooldown per user
- Zoom and pan for large grids (`react-zoom-pan-pinch`)
- Territory statistics dashboard
- Live activity feed
- Leaderboard by cells owned
- Dark glassmorphism UI with Framer Motion animations
- Toast notifications and loading/error states

## Project structure

```
shared-gird-app/
├── backend/
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/database.js
│       ├── models/{User,Cell}.js
│       ├── controllers/{gridController,userController}.js
│       ├── routes/{gridRoutes,userRoutes}.js
│       ├── sockets/socketHandler.js
│       ├── middleware/errorHandler.js
│       └── utils/
└── frontend/
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

## Prerequisites

- Node.js 20.9+
- MongoDB running locally or a MongoDB Atlas URI

## Environment variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shared-grid
CLIENT_URL=http://localhost:3000
GRID_ROWS=50
GRID_COLUMNS=50
CLAIM_COOLDOWN_MS=5000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Copy from `.env.example` files in each directory.

## Run locally

### 1. Start MongoDB

Ensure MongoDB is running on `mongodb://localhost:27017` or update `MONGO_URI`.

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

Open two browser windows to test real-time collaboration.

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grid` | Full grid state and stats |
| GET | `/api/grid/leaderboard` | Ranked users by cells owned |
| POST | `/api/grid/claim` | Claim a cell (REST alternative) |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/:userId/stats` | User profile and claim count |
| GET | `/health` | Health check |

### Create user

```json
POST /api/users
{ "username": "Aman", "color": "#ff0000" }
```

### Claim cell

```json
POST /api/grid/claim
{ "row": 10, "column": 20, "userId": "...", "color": "#ff0000" }
```

## Production notes

- Set `CLIENT_URL` to your deployed frontend origin for CORS.
- Use a managed MongoDB cluster with indexes (row/column unique index is included).
- Consider rate limiting on claim endpoints for abuse prevention.
- For horizontal scaling, use the Socket.IO Redis adapter so events propagate across multiple server instances.

## Scripts

| App | Command | Description |
|-----|---------|-------------|
| Backend | `npm run dev` | Start with file watching |
| Backend | `npm start` | Production start |
| Frontend | `npm run dev` | Next.js dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm start` | Serve production build |
