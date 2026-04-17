Phase 1 - Project Setup (Backend + Frontend) #2

## 📌 Description
Set up the backend Spring Boot project and frontend project skeleton (React/Next.js or plain JS).

## ✅ Backend Tasks
- [x] Initialize Spring Boot project
- [x] Add dependencies (Web, JPA, PostgreSQL, Security, Lombok)
- [x] Configure application.properties
- [x] Connect to PostgreSQL (Docker)
- [x] Run backend successfully

## ✅ Frontend Tasks
- [x] Initialize frontend project (Angular)
- [x] Create folder structure: components, pages, services, styles
- [x] Configure HTTP client to connect backend API
- [x] Run frontend successfully

## 🎯 Goal
Backend and frontend are running and able to connect with each other.

Phase 2 - Database Design + Frontend Models #3
## 📌 Description
Design database tables and prepare frontend models for API consumption.

## ✅ Backend Tasks
- [x] Create User entity
- [x] Create Post entity
- [x] Create Comment entity
- [x] Create Like entity
- [x] Create Subscription entity
- [x] Create Report entity
- [x] Add relationships (OneToMany, ManyToOne, etc.)
- [x] Verify tables in database

## ✅ Frontend Tasks
- [x] Create User model
- [x] Create Post model
- [x] Create Comment model
- [x] Create Like model
- [x] Create Subscription model
- [x] Create Report model
- [x] Set up dummy data to test API connection

## 🎯 Goal
Backend tables and frontend models are ready and aligned for API calls.

Phase 3 - Repository Layer + Frontend Services #4
## 📌 Description
Implement backend repositories and frontend service layer for API calls.

## ✅ Backend Tasks
- [x] Create UserRepository
- [ ] Create PostRepository
- [ ] Create CommentRepository
- [ ] Create LikeRepository
- [ ] Create SubscriptionRepository
- [ ] Create ReportRepository

## ✅ Frontend Tasks
- [x] Create API service for User (auth)
- [ ] Create API service for Post
- [ ] Create API service for Comment
- [ ] Create API service for Like
- [ ] Create API service for Subscription
- [ ] Create API service for Report
- [ ] Test fetching data from backend

## 🎯 Goal
Repositories and frontend services are connected and functional.

Phase 4 - Service Layer + Frontend State/Store #5
## 📌 Description
Implement business logic in backend services and manage frontend state.

## ✅ Backend Tasks
- [x] Create UserService
- [ ] Create PostService
- [ ] Create CommentService
- [ ] Create LikeService
- [ ] Create SubscriptionService
- [ ] Implement business logic

## ✅ Frontend Tasks
- [ ] Set up state management (Context API / Redux / Vanilla JS store)
- [ ] Connect frontend state with backend services
- [ ] Test user registration, post creation, comments

## 🎯 Goal
Business logic is applied and frontend can consume it with state management.

Phase 5 - Controllers (API) + Frontend Pages #6
## 📌 Description
Create backend controllers and frontend pages for CRUD operations.

## ✅ Backend Tasks
- [x] Create AuthController
- [ ] Create UserController
- [ ] Create PostController
- [ ] Create CommentController
- [ ] Implement endpoints:
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /users
- [x] GET /users/{id}
- [ ] POST /posts
- [ ] GET /posts
- [ ] DELETE /posts/{id}
- [ ] POST /comments

## ✅ Frontend Tasks
- [x] Create registration/login pages
- [ ] Create user profile page
- [x] Create post feed page
- [ ] Create post creation page
- [ ] Create comment component
- [ ] Connect pages to backend endpoints

## 🎯 Goal
Frontend pages are functional with backend API.

Phase 6 - Authentication & Security #7
## 📌 Description
Secure backend and integrate frontend authentication flows.

## ✅ Backend Tasks
- [ ] Configure Spring Security
- [ ] Implement JWT authentication
- [ ] Add password hashing
- [ ] Protect routes
- [ ] Add roles (USER / ADMIN)

## ✅ Frontend Tasks
- [ ] Store JWT token in localStorage / cookies
- [ ] Protect frontend routes (redirect if not logged in)
- [ ] Add login/logout functionality
- [ ] Role-based access control

## 🎯 Goal
Secure backend + frontend authentication is fully functional.

Phase 7 - Social Features #8
## 📌 Description
Add social interactions: likes, comments, follow system, notifications.

## ✅ Backend Tasks
- [ ] Implement follow system
- [ ] Implement like system
- [ ] Implement comment system
- [ ] Add notifications logic

## ✅ Frontend Tasks
- [ ] Display posts with likes/comments
- [ ] Add follow/unfollow buttons
- [ ] Add notification system UI
- [ ] Test all interactions in UI

## 🎯 Goal
Full social interaction features are working.

Phase 8 - Media Upload #9
## 📌 Description
Enable media upload on backend and frontend.

## ✅ Backend Tasks
- [ ] Implement file upload (image/video)
- [ ] Store files locally
- [ ] Create endpoint to serve media

## ✅ Frontend Tasks
- [ ] Add file upload input on post creation
- [ ] Display uploaded images/videos in feed
- [ ] Test upload and retrieval

## 🎯 Goal
Users can upload and view media files.

Phase 9 - Reports & Admin #10
## 📌 Description
Enable reporting and admin moderation.

## ✅ Backend Tasks
- [ ] Implement report system
- [ ] Store report reason + timestamp
- [ ] Create admin endpoints:
    - [ ] View users
    - [ ] Delete posts
    - [ ] Ban users

## ✅ Frontend Tasks
- [ ] Admin panel pages for user/post management
- [ ] Display reports
- [ ] Allow admin to delete/ban content

## 🎯 Goal
Admin panel fully functional for moderation.

Phase 10 - Testing #11
## 📌 Description
Write tests for backend and frontend to ensure reliability.

## ✅ Backend Tasks
- [ ] Unit tests (services)
- [ ] Integration tests (API)

## ✅ Frontend Tasks
- [ ] Unit tests for components
- [ ] Integration tests for pages and services

## 🎯 Goal
Both backend and frontend are tested and stable.

Phase 11 - Docker & Deployment #12
## 📌 Description
Containerize and deploy the full application.

## ✅ Backend Tasks
- [ ] Create Dockerfile
- [ ] Configure docker-compose (backend + postgres)
- [ ] Run full system
- [ ] Fix environment variables

## ✅ Frontend Tasks
- [ ] Dockerize frontend
- [ ] Add frontend to docker-compose
- [ ] Ensure frontend can reach backend in Docker network
- [ ] Test full stack deployment

## 🎯 Goal
Full system runs in Docker containers with frontend + backend communication.