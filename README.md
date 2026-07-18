# Calendar & Scheduling App

A full-stack calendar and scheduling web application:

- **Backend:** Node.js + Express + TypeScript, REST API, JWT auth (httpOnly cookie), JSON-file data store (no external database required to run it)
- **Frontend:** Vite + TypeScript (no framework), LESS for styling, hash-based routing
- **Features:** register/login, create/edit/delete calendar events (month view), user preferences (theme, week start day, time format, default event color), dark mode

The codebase is organized in **feature modules** on both the server (`server/src/modules/*`) and client (`client/src/modules/*`) so new features can be added without touching unrelated code — see [Architecture](#architecture) below.

## Requirements

- Node.js 18+
- npm 9+

## Quick start

```bash
# from the repo root
npm run install:all

# copy sample env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# run both the API server and the Vite dev server together
npm run dev
```

- Frontend (Vite dev server): http://localhost:5173
- Backend API: http://localhost:4000 (proxied through the Vite dev server at `/api/*`, so the frontend always just calls relative `/api/...` URLs)

You can also run each side individually:

```bash
npm run dev:server   # API only, http://localhost:4000
npm run dev:client   # frontend only, http://localhost:5173
```

## Configuration

Both `server/` and `client/` have a `.env.example` file. Copy each to `.env` in the same folder and adjust values as needed. `.env` files are git-ignored and must never be committed — see `.gitignore`.

**server/.env**

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API server port | `4000` |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `JWT_SECRET` | Secret used to sign auth tokens — **set a real random value in any real deployment** | (placeholder) |
| `JWT_EXPIRES_IN` | Auth token lifetime | `7d` |
| `AUTH_COOKIE_NAME` | Name of the httpOnly auth cookie | `calendar_app_token` |
| `DATA_DIR` | Where JSON data files are stored | `data` |
| `NODE_ENV` | `development` or `production` | `development` |

**client/.env**

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_PROXY_TARGET` | Where the Vite dev server proxies `/api` requests | `http://localhost:4000` |

## Production build

```bash
npm run build          # builds both server (tsc) and client (vite build)
npm run build:server
npm run build:client

npm start               # runs the built server (server/dist/index.js)
```

In production, serve the built client (`client/dist/`) from any static host or CDN, and point it at the deployed API (update CORS `CLIENT_ORIGIN` on the server accordingly). Alternatively, add a small static-file middleware to `server/src/app.ts` to serve `client/dist` directly from the same Express process.

## Architecture

### Server (`server/src`)

```
config/        environment/config loading
db/            generic Repository<T> interface + JSON-file implementation
middleware/    auth guard, error handler
modules/
  auth/        register/login/logout (issues JWT, sets httpOnly cookie)
  users/       profile + preferences
  events/      calendar event CRUD, scoped per user
utils/         validation helpers, ApiError, asyncHandler
app.ts         composition root: wires repositories -> services -> controllers -> routers
index.ts       process entrypoint
```

Each feature module follows the same shape: `*.model.ts` (types), `*.service.ts` (business logic + data access via `Repository<T>`), `*.controller.ts` (HTTP request/response handling + input validation), `*.routes.ts` (Express router). To add a new feature (e.g. "reminders"), create a `modules/reminders/` folder following this pattern and register its router in `app.ts` — nothing else needs to change.

The data layer is a small `Repository<T>` interface backed by `JsonFileRepository`, which persists each entity type as its own JSON file under `server/data/`. This keeps the sample app credential-free and dependency-light. To move to a real database, implement `Repository<T>` against your DB of choice and swap the constructor call in `app.ts` — the services and controllers don't change.

### Client (`client/src`)

```
api/           fetch-based API client + one module per resource (auth, users, events)
state/         tiny observable Store + the app-wide session store
router/        minimal hash-based router with auth guards
components/    shared UI pieces (Navbar, Toast)
modules/
  auth/        Login / Register pages
  calendar/    Month view, event modal, date utilities
  preferences/ Preferences page + theme (dark mode) logic
styles/        LESS - variables/theme (CSS custom properties), base, components, per-feature styles
utils/         small `el()` DOM-builder helper
main.ts        bootstraps theme, session, layout, router
```

There's no UI framework — views are built with a small `el()` hyperscript-style helper (`utils/dom.ts`) so the code stays plain TypeScript and dependency-light. Each page module is a function `(container: HTMLElement) => void` registered with the router in `main.ts`; adding a new page is: create `modules/<feature>/SomePage.ts`, register its route, optionally add a nav link.

Dark mode works via a `data-theme` attribute on `<html>`, which flips a set of CSS custom properties defined in `styles/_variables.less`. The theme preference is stored on the user's profile (`preferences.theme`, one of `light` / `dark` / `system`) and cached in `localStorage` so the correct theme applies immediately on reload, before the profile has loaded from the API.

## Security notes for real deployments

- Set a strong, random `JWT_SECRET`.
- Serve over HTTPS so the `secure` cookie flag (enabled automatically when `NODE_ENV=production`) is respected.
- The JSON file data store is intended for development/small deployments. For production-scale or multi-instance deployments, swap in a real database as described above.
