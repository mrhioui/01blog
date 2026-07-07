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
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT token |

### Posts — `/api/posts`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/posts` | Get all posts | Optional |
| GET | `/api/posts/paginated` | Get paginated posts | Optional |
| GET | `/api/posts/{id}` | Get a single post | Optional |
| POST | `/api/posts` | Create a post (multipart) |
| POST | `/api/posts/{id}/update` | Update a post (multipart) |
| DELETE | `/api/posts/{id}` | Delete a post |

### Users — `/api/users`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users` | Get all users | ADMIN |
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile & images |
| GET | `/api/users/me/posts` | Get current user's posts |
| GET | `/api/users/community` | Get community users | Optional |
| GET | `/api/users/search?q=` | Search users by query | Optional |
| GET | `/api/users/{id}/profile` | Get a user's profile | Optional |
| GET | `/api/users/{id}/posts` | Get a user's posts | Optional |
| POST | `/api/users/{id}/ban` | Ban a user | ADMIN |
| POST | `/api/users/{id}/unban` | Unban a user | ADMIN |
| DELETE | `/api/users/{id}` | Delete a user | ADMIN |

### Comments — `/api/comments`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/comments/post/{postId}` | Get comments on a post | Optional |
| POST | `/api/comments` | Add a comment |
| DELETE | `/api/comments/{id}` | Delete a comment |

### Likes — `/api/likes`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/likes` | Like a post |
| DELETE | `/api/likes/{postId}` | Unlike a post |
| GET | `/api/likes/{postId}/status` | Get like status for a post |

### Subscriptions — `/api/subscriptions`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/subscriptions` | Subscribe to a user |
| DELETE | `/api/subscriptions/{targetId}` | Unsubscribe from a user |

### Notifications — `/api/notifications`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/{id}/mark-as-read` | Mark one as read |
| POST | `/api/notifications/mark-all-as-read` | Mark all as read |

### Reports — `/api/reports`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/reports` | Report a post |
| GET | `/api/reports` | Get all reports | ADMIN |
| GET | `/api/reports/count` | Get total report count | ADMIN |
| DELETE | `/api/reports/{id}` | Delete a report | ADMIN |

---

## Configuration

All configuration lives in `src/main/resources/application.properties`.

| Property | Description |
|---|---|
| `spring.datasource.url` | PostgreSQL JDBC connection URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `jwt.secret` | Secret key used to sign JWT tokens |
| `jwt.expiration` | JWT token expiration in milliseconds (default: 86400000 = 24h) |
| `app.upload-dir` | Directory where uploaded images are stored |

---

## Default Seeded Users

On first startup with an empty database, `DataInitializer.java` creates two users automatically:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `user` | `user123` | USER |

---

## Running Locally (Without Docker)

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL running on port `5433`

### Steps

1. Make sure PostgreSQL is running and a database named `01Blog_db` exists.
2. Check credentials in `src/main/resources/application.properties`.
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
- CORS is configured to allow requests from `http://localhost:4200`.
