# 01Blog

01Blog is a full-stack blog platform built with:

- **Backend:** Spring Boot 3, Spring Security, Spring Data JPA, JWT, PostgreSQL
- **Frontend:** Angular 21, Bootstrap, Ng Bootstrap
- **Containerization:** Docker and Docker Compose

The project includes authentication, posts, comments, likes, subscriptions, notifications, reports, and an admin area.

## Project Overview

The application is split into three parts:

- **PostgreSQL** stores the application data
- **Spring Boot backend** exposes the REST API and handles business logic
- **Angular frontend** provides the user interface and consumes the API

The default Docker setup runs all three services together.

## Architecture

### 1. Frontend

The frontend lives in [`frontend/`](./frontend).

It is an Angular single-page application built with a component-based structure:

- `src/app/features/` contains feature modules such as:
  - `auth` for login and registration
  - `posts` for feed, post details, and post creation
  - `profile` for user profile pages
  - `admin` for dashboard, users, posts, and reports management
- `src/app/core/` contains shared infrastructure:
  - API service wrappers
  - HTTP interceptors
  - route guards
  - shared models and utility services
- `src/app/shared/` contains reusable UI pieces such as:
  - navbar
  - loader
  - modals
  - custom pipes
- `src/app/layouts/` contains the main application layout

How it works:

- Angular boots from [`src/main.ts`](./frontend/src/main.ts)
- [`app.config.ts`](./frontend/src/app/app.config.ts) wires routing, HTTP interceptors, animations, and error handling
- [`app.routes.ts`](./frontend/src/app/app.routes.ts) defines the public and protected routes
- Environment files switch the API base URL:
  - [`environment.ts`](./frontend/src/environments/environment.ts) for local development
  - [`environment.prod.ts`](./frontend/src/environments/environment.prod.ts) for production/Docker

Frontend request flow:

- components and pages call shared API services
- those services use `environment.apiUrl`
- auth tokens are attached through the HTTP interceptor
- route guards protect authenticated and admin-only pages

### 2. Backend

The backend lives in [`Backend/`](./Backend).

It is a Spring Boot application organized by responsibility:

- `controller/` exposes REST endpoints
- `service/` contains business logic
- `repository/` provides Spring Data JPA access to PostgreSQL
- `model/` contains the JPA entities
- `dto/` contains request and response objects
- `security/` contains JWT and user details logic
- `config/` contains security, CORS, initialization, and web config

Main backend responsibilities:

- user registration and authentication
- JWT-based security
- CRUD operations for posts and comments
- likes and subscriptions
- notifications and reports
- admin-oriented endpoints such as counts and management pages
- file uploads for media content

Important backend files:

- [`DemoApplication.java`](./Backend/src/main/java/com/example/demo/DemoApplication.java) starts the Spring Boot app
- [`SecurityConfig.java`](./Backend/src/main/java/com/example/demo/config/SecurityConfig.java) configures JWT security, CORS, and stateless sessions
- [`WebConfig.java`](./Backend/src/main/java/com/example/demo/config/WebConfig.java) exposes uploaded files under `/uploads/**`
- [`DataInitializer.java`](./Backend/src/main/java/com/example/demo/config/DataInitializer.java) seeds default users when the database is empty

### 3. Database

The project uses PostgreSQL.

With Docker Compose, the database is persisted in the local [`postgres_data`](./postgres_data) directory so data survives container restarts.

## Docker Compose

The root [`docker-compose.yml`](./docker-compose.yml) starts:

- `postgres-db` on port `5433`
- `backend` on port `8080`
- `frontend` on port `4200`

Service behavior:

- `postgres-db` runs `postgres:15`
- `backend` is built from [`Backend/Dockerfile`](./Backend/Dockerfile)
- `frontend` is built from [`frontend/Dockerfile`](./frontend/Dockerfile)
- the frontend is served by Nginx inside the container
- the backend connects to PostgreSQL through the Docker network using the service name `postgres-db`

## Running With Docker

### Start the full stack

```bash
docker compose up -d --build
```

### Stop the stack

```bash
docker compose down
```

### Remove database data too

If you want a clean reset, remove the persisted database directory after stopping the containers:

```bash
rm -rf postgres_data
```

## Running Locally Without Docker

### Backend

From the [`Backend/`](./Backend) directory:

```bash
mvn spring-boot:run
```

The backend expects PostgreSQL on:

- `jdbc:postgresql://localhost:5433/01Blog_db`

Make sure your local PostgreSQL instance matches the credentials in [`application.properties`](./Backend/src/main/resources/application.properties).

### Frontend

From the [`frontend/`](./frontend) directory:

```bash
npm install
npm start
```

The frontend runs on:

- `http://localhost:4200`

In local development it calls the backend at:

- `http://localhost:8080/api`

## Default Credentials

When the backend starts with an empty database, it seeds two users:

- `admin / admin123`
- `user / user123`

These are created by [`DataInitializer.java`](./Backend/src/main/java/com/example/demo/config/DataInitializer.java).

## Main URLs

After the stack is running:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5433`

## Notes

- The backend uses JWT and stateless authentication.
- CORS is configured for `http://localhost:4200` and `http://127.0.0.1:4200`.
- Uploaded files are served from `/uploads/**`.
- The frontend production build uses a relative API base path (`/api`). If you serve the app through Nginx in Docker, you may also need a reverse proxy rule for `/api` so browser requests reach the backend container.
