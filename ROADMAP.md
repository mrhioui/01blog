# 01Blog Code Audit Map

This document is meant to help you read the app source and follow the code flow from the Angular frontend to the Spring Boot backend and back.

## 1. Big Picture
- `frontend/` is the browser app.
- `Backend/` is the API and business logic.
- `docker-compose.yml` wires frontend, backend, and PostgreSQL together.
- The main pattern is: UI event -> Angular service -> HTTP request -> Spring controller -> service -> repository -> database -> response back to UI.

## 2. Frontend Entry Flow
- `frontend/src/main.ts` boots the Angular app.
- `frontend/src/app/app.config.ts` registers routing, HTTP interceptors, and animations.
- `frontend/src/app/app.routes.ts` maps URLs to pages and guards.
- `frontend/src/app/layouts/main-layout/` is the shell that renders the app chrome.

### Frontend request path
1. A page component handles the user action.
2. The component calls a feature or core service.
3. The service uses the shared API wrapper.
4. `authInterceptor` attaches the JWT token.
5. `errorInterceptor` redirects to `/login` on `401`.

## 3. Backend Entry Flow
- `Backend/src/main/java/com/example/demo/DemoApplication.java` starts Spring Boot.
- `Backend/src/main/resources/application.properties` configures DB, JPA, uploads, and logging.
- `SecurityConfig` defines auth rules and request access.
- `JwtAuthenticationFilter` reads the bearer token and loads the authenticated user.
- `UserDetailsServiceImpl` turns a database `User` into Spring Security user details.

### Backend request path
1. Spring receives the request.
2. Security filter reads and validates the JWT.
3. Controller matches the route.
4. Controller calls the service layer.
5. Service applies business rules.
6. Repository executes database reads or writes.
7. DTOs are returned to the frontend.

## 4. Auth Flow
### Login
- `frontend/src/app/features/auth/pages/login/` submits credentials.
- `Backend/src/main/java/com/example/demo/controller/AuthController.java` authenticates with `AuthenticationManager`.
- `JwtUtils` generates the token.
- The backend returns `AuthResponse` with the token and current user.

### Request authorization
- The frontend stores the token in `localStorage`.
- `authInterceptor` adds `Authorization: Bearer <token>` to API calls.
- `JwtAuthenticationFilter` validates the token on each request.
- `UserDetailsServiceImpl` checks the user exists and whether the account is banned.

## 5. User Flow
### Read current user
- `GET /api/users/me` goes to `UserController.getCurrentUser(...)`.
- `UserService.getCurrentUser(...)` loads the user from the repository.
- `UserService.convertToDTO(...)` enriches the response with counts and flags.

### Edit profile
- `PUT /api/users/me` goes to `UserController.updateCurrentUser(...)`.
- `UserService.updateCurrentUser(...)` validates username and email, stores uploaded images, and saves the user.

### Public profile and search
- `GET /api/users/{id}/profile` returns a public profile DTO.
- `GET /api/users/search` returns matching users for search.

### Admin user actions
- `GET /api/users` lists all users for admins.
- `POST /api/users/{id}/ban` bans a user.
- `POST /api/users/{id}/unban` removes the ban.
- `DELETE /api/users/{id}` deletes a user after cleanup.

## 6. Post Flow
### Feed and post detail
- `GET /api/posts` returns the feed.
- `GET /api/posts/{id}` returns one post.
- `GET /api/posts/paginated` supports infinite or paged loading.

### Create and edit
- `POST /api/posts` creates a post from form data.
- `PUT /api/posts/{id}` and `POST /api/posts/{id}/update` edit the post.
- `PostService` decides whether to store a file or use a provided media URL.

### Delete
- `DELETE /api/posts/{id}` goes through `PostService.deletePost(...)`.
- The service removes notifications and reports tied to the post before deleting it.

## 7. Report Flow
- `POST /api/reports` creates a report.
- `GET /api/reports` is admin-only.
- `DELETE /api/reports/{id}` removes a report.
- `ReportService` resolves whether the report targets a user or a post.

## 8. Admin Flow
### Admin dashboard
- `frontend/src/app/features/admin/pages/admin-dashboard/` is the main admin hub.
- It displays users, posts, and reports.
- It routes action buttons to admin services.

### Admin user management
- The UI hides ban actions for admin accounts.
- The backend also rejects attempts to ban admin users.
- User deletion now removes dependent records first.

### Admin reports
- Reports can be dismissed, related posts can be deleted, and non-admin users can be banned.

## 9. Data Model Flow
- `User` is the central entity.
- `Post` belongs to a `User`.
- `Comment` belongs to a `User` and a `Post`.
- `PostLike` belongs to a `User` and a `Post`.
- `Subscription` links two users.
- `Notification` belongs to a user and often points to a related post or event.
- `Report` can point to either a user or a post.

## 10. Cleanup and Protection Rules
- Seeded users are created only when the DB is empty by `DataInitializer`.
- `UserService.deleteUser(...)` now removes posts and related rows before deleting the user.
- `UserService.banUser(...)` blocks banning admin users.
- `JwtAuthenticationFilter` rejects banned accounts.
- These are business rules, not just UI checks.

## 11. Where To Read First
If you want to understand the app quickly, read in this order:
1. `frontend/src/app/app.routes.ts`
2. `frontend/src/app/core/interceptors/auth-interceptor.ts`
3. `frontend/src/app/core/interceptors/error-interceptor.ts`
4. `Backend/src/main/java/com/example/demo/config/SecurityConfig.java`
5. `Backend/src/main/java/com/example/demo/security/JwtAuthenticationFilter.java`
6. `Backend/src/main/java/com/example/demo/controller/AuthController.java`
7. `Backend/src/main/java/com/example/demo/controller/UserController.java`
8. `Backend/src/main/java/com/example/demo/service/UserService.java`
9. `Backend/src/main/java/com/example/demo/service/PostService.java`
10. `Backend/src/main/java/com/example/demo/service/ReportService.java`

## 12. Audit Checklist
- Check whether a feature is enforced in the UI, backend, or both.
- Check whether the controller passes the right identity into the service.
- Check whether the service cleans up dependent data before delete operations.
- Check whether DTOs expose only the data needed by the UI.
- Check whether JWT-based auth is respected on every protected route.
- Check whether admin-only routes have both route guards and backend authorization.

