# 01Blog — Backend

The backend is a **Spring Boot 3** REST API that handles all business logic, authentication, and database access for the 01Blog platform.

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.x | Framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | — | Database ORM |
| JWT (jjwt) | — | Stateless token auth |
| PostgreSQL | 15 | Database |
| Lombok | — | Boilerplate reduction |
| Maven | 3.9.x | Build tool |

---

## Project Structure

```
Backend/
├── src/
│   └── main/
│       ├── java/com/example/demo/
│       │   ├── DemoApplication.java       ← Entry point
│       │   ├── config/                    ← Security, CORS, Web, DataInitializer
│       │   ├── controller/                ← REST endpoints
│       │   ├── dto/                       ← Request & Response objects
│       │   ├── model/                     ← JPA Entities
│       │   ├── repository/                ← Spring Data JPA interfaces
│       │   ├── security/                  ← JWT logic & UserDetailsService
│       │   └── service/                   ← Business logic
│       └── resources/
│           └── application.properties     ← App configuration
└── Dockerfile                             ← Multi-stage Docker build
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT token | Public |

### Posts — `/api/posts`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/posts/paginated` | Get the paginated feed | Optional |
| GET | `/api/posts/{id}` | Get a single post | Optional |
| POST | `/api/posts` | Create a post (multipart: `title`, `content`, `mediaUrl`/`image`) | Auth |
| PUT | `/api/posts/{id}` | Update a post (multipart: `title`, `content`, `mediaUrl`/`image`) | Author/Admin |
| DELETE | `/api/posts/{id}` | Delete a post | Author/Admin |
| GET | `/api/posts/count` | Total post count | ADMIN |

### Users — `/api/users`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | Get all users | ADMIN |
| GET | `/api/users/count` | Total user count | ADMIN |
| GET | `/api/users/community` | Get community users | Auth |
| GET | `/api/users/search?q=` | Search users by query | Auth |
| GET | `/api/users/me` | Get current user | Auth |
| PUT | `/api/users/me` | Update profile & images (multipart) | Auth |
| GET | `/api/users/me/posts` | Get current user's posts | Auth |
| GET | `/api/users/{id}/profile` | Get a user's profile | Optional |
| GET | `/api/users/{id}/posts` | Get a user's posts (empty for private profiles unless owner/admin) | Optional |
| POST | `/api/users/{id}/ban` | Ban a user | ADMIN |
| POST | `/api/users/{id}/unban` | Unban a user | ADMIN |
| DELETE | `/api/users/{id}` | Delete a user | ADMIN |

### Comments — `/api/comments`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/comments/post/{postId}` | Get comments on a post | Auth |
| POST | `/api/comments` | Add a comment | Auth |

### Likes — `/api/likes`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/likes` | Like a post (body: `{ postId }`) | Auth |
| GET | `/api/likes/post/{postId}/status` | Get like status & count for a post | Auth |
| POST | `/api/likes/post/{postId}/toggle` | Toggle like on a post | Auth |

### Subscriptions — `/api/subscriptions`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/subscriptions` | Subscribe to a user | Auth |
| DELETE | `/api/subscriptions/{targetId}` | Unsubscribe from a user | Auth |

### Notifications — `/api/notifications`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/notifications` | Get all notifications | Auth |
| GET | `/api/notifications/unread-count` | Get unread count | Auth |
| POST | `/api/notifications/{id}/mark-as-read` | Mark one as read | Auth |
| POST | `/api/notifications/{id}/mark-as-unread` | Mark one as unread | Auth |
| POST | `/api/notifications/mark-all-as-read` | Mark all as read | Auth |

### Reports — `/api/reports`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/reports` | Report a post | Auth |
| GET | `/api/reports` | Get all reports | ADMIN |
| GET | `/api/reports/count` | Get total report count | ADMIN |
| DELETE | `/api/reports/{id}` | Delete a report | ADMIN |

---

## Configuration

`src/main/resources/application.properties` reads its values from **environment variables** (with a few sensible defaults). In Docker these are supplied by the root `.env`; for a local run, export them or provide your own `.env`.

| Property | Environment variable | Description |
|---|---|---|
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | Database username |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | Database password |
| `spring.jpa.hibernate.ddl-auto` | `SPRING_JPA_DDL_AUTO` | Schema mode (default `update`; use `validate`/`none` in production) |
| `spring.servlet.multipart.max-file-size` | `MAX_UPLOAD_FILE_SIZE` | Max upload file size (default `25MB`) |
| `spring.servlet.multipart.max-request-size` | `MAX_UPLOAD_REQUEST_SIZE` | Max upload request size (default `25MB`) |
| `jwt.secret` | `JWT_SECRET` | Secret key used to sign JWT tokens |
| `jwt.expiration` | `JWT_EXPIRATION` | JWT token expiration in ms (e.g. `86400000` = 24h) |
| `app.upload-dir` | — | Directory where uploaded media is stored (fixed: `uploads`) |
| `app.default-admin-password` | `APP_DEFAULT_ADMIN_PASSWORD` | Seed password for `admin`. Optional — if blank/unset, seeding is skipped |
| `app.default-user-password` | `APP_DEFAULT_USER_PASSWORD` | Seed password for `user`. Optional — if blank/unset, seeding is skipped |

---

## Default Seeded Users

On first startup with an empty database, `DataInitializer.java` creates two users — **only if** the seed passwords are configured (via `app.default-admin-password` / `app.default-user-password`, typically supplied as the `APP_DEFAULT_ADMIN_PASSWORD` / `APP_DEFAULT_USER_PASSWORD` environment variables). If either password is blank or unset, seeding is skipped and the app still starts.

| Username | Password | Role |
|---|---|---|
| `admin` | `${app.default-admin-password}` | ADMIN |
| `user` | `${app.default-user-password}` | USER |

> The sample `.env` in the repo sets these to `admin123` / `user123` for local development. Change them for any non-local deployment.

---

## Running Locally (Without Docker)

### Prerequisites
- Java 17+
- Maven 3.9+
- A running PostgreSQL instance with a database named `01Blog_db`

### Steps

1. Make sure PostgreSQL is running and the `01Blog_db` database exists.
2. Provide the required environment variables (see the [Configuration](#configuration) table). The app reads its datasource, JWT, and seed settings from the environment — the connection is **not** hardcoded in `application.properties`. The repo's `.env` targets the Dockerized DB (`postgres-db:5432`), so for a local run point `SPRING_DATASOURCE_URL` at your own instance, e.g.:

   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/01Blog_db
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=your_password
   export JWT_SECRET=your_secret
   export JWT_EXPIRATION=86400000
   ```

3. From the `Backend/` directory, run:

```bash
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

---

## Running With Docker

From the project root:

```bash
docker compose up -d --build
```

The Dockerfile uses a **multi-stage build**:
1. **Stage 1 (build):** Uses a Maven image to compile the project and produce the `.jar` file.
2. **Stage 2 (run):** Copies only the `.jar` into a lightweight JDK image to keep the final image small.

---

## Security

- Authentication is **stateless** using JWT (no sessions).
- Every protected request must include the header: `Authorization: Bearer <token>`
- Role-based access control is enforced with `@PreAuthorize("hasRole('ADMIN')")` on admin-only endpoints.
- Private profiles (`profilePublic = false`) hide their posts from everyone except the profile owner and admins.
- CORS is configured to allow requests from `http://localhost:4200`.
