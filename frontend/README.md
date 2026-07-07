# 01Blog — Frontend

The frontend is an **Angular 21** single-page application (SPA) that provides the user interface for the 01Blog platform. It is served in production by **Nginx** inside a Docker container.

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Angular | 21 | SPA Framework |
| TypeScript | — | Language |
| Bootstrap / Ng-Bootstrap | — | UI Components & Layout |
| Nginx | alpine | Production static file server |
| Node.js | 20 | Build environment |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.config.ts          ← Bootstraps routing, HTTP, animations
│   │   ├── app.routes.ts          ← All application routes
│   │   ├── core/
│   │   │   ├── guards/            ← authGuard, adminGuard
│   │   │   ├── interceptors/      ← JWT token interceptor
│   │   │   ├── models/            ← TypeScript interfaces (Post, User, Comment...)
│   │   │   └── services/          ← Shared API services (notifications, etc.)
│   │   ├── features/
│   │   │   ├── admin/             ← Admin dashboard (users, posts, reports)
│   │   │   ├── auth/              ← Login & Register pages
│   │   │   ├── community/         ← Community directory page
│   │   │   ├── notifications/     ← Notifications center page
│   │   │   ├── posts/             ← Feed, post details, post creation
│   │   │   └── profile/           ← User profile page
│   │   ├── layouts/               ← Main app layout wrapper
│   │   └── shared/
│   │       ├── components/        ← Navbar, loader, modals, reusable UI
│   │       └── pipes/             ← Custom Angular pipes (e.g. resolve-url)
│   ├── environments/
│   │   ├── environment.ts         ← Local dev config (API: localhost:8080)
│   │   └── environment.prod.ts    ← Production config (API: /api)
│   └── main.ts                    ← Angular bootstrap entry point
├── nginx.conf                     ← Nginx config for SPA routing + caching
├── Dockerfile                     ← Multi-stage build (Node build → Nginx serve)
├── .editorconfig                  ← Editor formatting rules
└── .prettierrc                    ← Prettier code formatting config
```

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Feed (all posts) | Public |
| `/login` | Login page | Public |
| `/register` | Register page | Public |
| `/posts/:id` | Post details & comments | Auth |
| `/profile` | My profile | Auth |
| `/profile/:id` | Another user's profile | Auth |
| `/community` | Community directory | Auth |
| `/notifications` | Notifications center | Auth |
| `/admin` | Admin dashboard | Admin |
| `/admin/users` | Admin — users list | Admin |
| `/admin/posts` | Admin — posts list | Admin |
| `/admin/reports` | Admin — reports list | Admin |

---

## How Authentication Works

1. User logs in → Backend returns a **JWT token**.
2. Token is stored in `localStorage`.
3. The **HTTP interceptor** (`core/interceptors/`) automatically attaches the token to every outgoing API request as:
   ```
   Authorization: Bearer <token>
   ```
4. **Route guards** (`authGuard`, `adminGuard`) check if the user is logged in / has the admin role before allowing navigation to protected pages.

---

## Environment Configuration

| File | `apiUrl` | Used when |
|---|---|---|
| `environment.ts` | `http://localhost:8080/api` | Local development (`ng serve`) |
| `environment.prod.ts` | `/api` | Production Docker build |

In production (Docker), the Nginx config proxies requests so the browser calls `/api/...` which is resolved by the backend container through the Docker network.

---

## Running Locally (Without Docker)

### Prerequisites
- Node.js 20+
- npm

### Steps

1. From the `frontend/` directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm start
   ```

The app will be available at: `http://localhost:4200`

> The backend must also be running at `http://localhost:8080` for API calls to work.

---

## Running With Docker

From the project root:

```bash
docker compose up -d --build
```

The Dockerfile uses a **multi-stage build**:
1. **Stage 1 (build):** Uses a Node.js image to run `npm ci` and `npm run build`, producing the compiled static files.
2. **Stage 2 (serve):** Copies the compiled files into a lightweight **Nginx** image to serve them.

The app will be available at: `http://localhost:4200`

---

## Nginx Configuration

The `nginx.conf` is configured for Angular SPA routing:

- **`try_files $uri $uri/ /index.html`** — Redirects all unknown paths back to `index.html` so Angular's client-side router can handle them. Without this, refreshing any page (e.g. `/profile/5`) would return a 404.
- **Static asset caching** — CSS, JS, images, fonts, and videos are cached for **6 months** in the browser for performance.
- **Error pages** — 5xx server errors are handled gracefully.

---

## Default Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `user` | `user123` | Regular User |

These are seeded by the backend on first startup with an empty database.
