# Connect 4

A full-stack Connect 4 rebuilt from a plain HTML/CSS/JS prototype into a typed, tested,
multiplayer app.

- **Local**: two players, one screen (with undo)
- **Vs computer**: minimax AI with alpha-beta pruning, three difficulty levels
- **Online**: create a room, share the code or link, play in real time. Refresh-safe:
  you reclaim your seat if you reload or lose connection

**Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, react-router, Node, Express,
Socket.IO, zod, Vitest.

## Prerequisites

Node.js **22.22 or newer** (22 LTS or 24). Some dependencies (react-router 8, Vitest 5) require it.

```powershell
node -v    # should print v22.22.0 or higher
```

## Quick start (development)

```powershell
npm install
npm run dev
```

Then open **http://localhost:5173**.

`npm run dev` starts three things together: a watcher that rebuilds the shared package,
the game server on `:3001`, and the Vite dev server on `:5173` (which proxies `/socket.io`
and `/api` to the server, so there is no CORS setup to worry about).

To try online play on one machine, open the site in two browser tabs: create a room in the
first, then paste the code (or the invite link) into the second. Each tab keeps its own seat.

## Scripts (run from the repo root)

| Command             | What it does                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run dev`       | Shared watcher + server + client with hot reload                         |
| `npm run build`     | Builds shared, then server (`server/dist`), then client (`client/dist`)  |
| `npm start`         | Runs the built server (set `NODE_ENV=production` to also serve the client) |
| `npm test`          | Builds shared, then runs the shared, server and client test suites       |
| `npm run typecheck` | Type-checks everything without emitting files                            |

## Production: one process serves everything

```powershell
npm run build
$env:NODE_ENV = "production"
npm start
```

With `NODE_ENV=production` the Node server also serves the built React app from
`client/dist` (including deep links like `/online/ABCDE`), so you deploy a single service.
It listens on `PORT` (default `3001`). On macOS/Linux use `NODE_ENV=production npm start`.

### Configuration

| Variable          | Where          | Default                 | Purpose                                                  |
| ----------------- | -------------- | ----------------------- | -------------------------------------------------------- |
| `PORT`            | server         | `3001`                  | Port for the API and WebSocket server                    |
| `CLIENT_ORIGIN`   | server         | `http://localhost:5173` | Browser origin(s) allowed to call the server (comma separated) |
| `VITE_SERVER_URL` | client (build) | empty                   | Absolute server URL, only if the API is hosted separately |

Copy `server/.env.example` to `server/.env` to set the server variables
(`Copy-Item server/.env.example server/.env`). Both files are optional; defaults work locally.

**Split hosting** (e.g. React on Vercel/Netlify, Node on Render/Railway): set
`VITE_SERVER_URL=https://your-server` when building the client, and set `CLIENT_ORIGIN` on the
server to the site's URL. The server needs a host that supports long-lived WebSocket
connections, and rooms live in memory, so run a single instance.

## Project layout

```
.
├── shared/                  # @connect4/shared: used by BOTH client and server
│   └── src/
│       ├── game.ts          # pure, immutable game engine (drop, win detection, draw)
│       ├── ai.ts            # negamax + alpha-beta, difficulty levels
│       ├── protocol.ts      # typed Socket.IO events + room/state types
│       └── game.test.ts
├── server/                  # @connect4/server: Express + Socket.IO
│   └── src/
│       ├── index.ts         # bootstrap, graceful shutdown, idle-room sweeper
│       ├── app.ts           # Express app (health check, static client in production)
│       ├── config.ts        # environment parsing
│       ├── rooms.ts         # RoomManager: all room/game rules, no socket code
│       ├── socket.ts        # Socket.IO handlers (validation, acks, broadcasting)
│       ├── validation.ts    # zod schemas for every incoming payload
│       └── rooms.test.ts
└── client/                  # @connect4/client: React + Tailwind v4
    └── src/
        ├── main.tsx, App.tsx, index.css   # entry, routes, Tailwind theme + animations
        ├── pages/           # Home, Local, Computer, OnlineLobby, OnlineRoom, NotFound
        ├── components/      # GameBoard, GameView, Scoreboard, StatusBanner, Disc, ...
        ├── hooks/           # useLocalGame (reducer + AI), useOnlineRoom, useColumnHotkeys
        ├── lib/             # socket singleton, session storage helpers, status text
        └── App.test.tsx
```

## How it works

- **One engine, two consumers.** `shared/game.ts` is a pure function library
  (`applyMove(state, column)` returns a new state or an error). The browser uses it for local
  and computer games; the server uses the same code as the referee for online games.
- **The server is authoritative.** Clients only *request* a move (`game:move`). The server
  checks the room, whose turn it is and the column, applies the move, and broadcasts the full
  `room:state` snapshot to both players. Clients never trust their own copy.
- **Seats survive refreshes.** Joining returns a secret token stored in `sessionStorage`.
  After a reload or reconnect the client sends `room:rejoin` with it. Abandoned rooms are
  deleted after 10 minutes with nobody connected.
- **Typed end to end.** Every socket event is declared once in `shared/protocol.ts`; renaming
  a field is a compile error on whichever side forgot to follow.
- **Board rendering.** Each column is a real `<button>` (mouse, touch and keyboard for free).
  The disc that was just played falls in via a CSS keyframe animation with a bounce; winning
  discs pulse. Animations respect `prefers-reduced-motion`.

## Testing

```powershell
npm test
```

- `shared`: engine rules (horizontal/vertical/diagonal wins, draws, invalid moves) and AI
  behaviour (takes wins, blocks threats, only plays legal columns)
- `server`: RoomManager rules (joining, turn order, rematch, reconnect, pruning)
- `client`: rendering and interaction tests (Testing Library + jsdom)

## Troubleshooting

- **`EBADENGINE` warnings / odd install errors**: check `node -v`, you need 22.22+.
- **Port already in use**: `$env:PORT = "3002"` for the server (and update the proxy target in
  `client/vite.config.ts`), or stop whatever is using `3001`/`5173`.
- **"Couldn't reach the game server"** in the online lobby: the server isn't running. Use
  `npm run dev` from the repo root (not just `npm run dev -w client`).
- **Editing `shared/`**: `npm run dev` rebuilds it automatically. If you run pieces
  separately, run `npm run build -w shared` first.

## Ideas for next steps

- Persist rooms and stats in a database (MongoDB or Redis) so restarts don't drop games
- Run the AI in a Web Worker and add a deeper "expert" level
- Accounts + leaderboard, spectators, a chat or emoji reactions
- Docker image and a CI workflow that runs `npm test`
