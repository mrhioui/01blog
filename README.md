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
- [x] Create PostRepository
- [x] Create CommentRepository
- [x] Create LikeRepository
- [x] Create SubscriptionRepository
- [x] Create ReportRepository

## ✅ Frontend Tasks
- [x] Create API service for User (auth)
- [x] Create API service for Post
- [x] Create API service for Comment
- [x] Create API service for Like
- [x] Create API service for Subscription
- [x] Create API service for Report
- [x] Test fetching data from backend

## 🎯 Goal
Repositories and frontend services are connected and functional.

Phase 4 - Service Layer + Frontend State/Store #5
## 📌 Description   
Implement business logic in backend services and manage frontend state.

## ✅ Backend Tasks
- [x] Create UserService
- [x] Create PostService
- [x] Create CommentService
- [x] Create LikeService
- [x] Create SubscriptionService
- [x] Implement business logic

## ✅ Frontend Tasks
- [x] Set up state management (Context API / Redux / Vanilla JS store)
- [x] Connect frontend state with backend services
- [x] Test user registration, post creation, comments

## 🎯 Goal
Business logic is applied and frontend can consume it with state management.

Phase 5 - Controllers (API) + Frontend Pages #6
## 📌 Description
Create backend controllers and frontend pages for CRUD operations.

## ✅ Backend Tasks
- [x] Create AuthController
- [x] Create UserController
- [x] Create PostController
- [x] Create CommentController
- [x] Implement endpoints:
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /users
- [x] GET /users/{id}
- [x] POST /posts
- [x] GET /posts
- [x] DELETE /posts/{id}
- [x] POST /comments

## ✅ Frontend Tasks
- [x] Create registration/login pages
- [x] Create user profile page
- [x] Create post feed page
- [x] Create post creation page
- [x] Create comment component
- [x] Connect pages to backend endpoints

## 🎯 Goal
Frontend pages are functional with backend API.

Phase 6 - Authentication & Security #7
## 📌 Description
Secure backend and integrate frontend authentication flows.

## ✅ Backend Tasks
- [x] Configure Spring Security
- [x] Implement JWT authentication
- [x] Add password hashing
- [x] Protect routes
- [x] Add roles (USER / ADMIN)

## ✅ Frontend Tasks
- [x] Store JWT token in localStorage / cookies
- [x] Protect frontend routes (redirect if not logged in)
- [x] Add login/logout functionality
- [x] Role-based access control

## 🎯 Goal
Secure backend + frontend authentication is fully functional.

Phase 7 - Social Features #8
## 📌 Description
Add social interactions: likes, comments, follow system, notifications.

## ✅ Backend Tasks
- [x] Implement follow system
- [x] Implement like system
- [x] Implement comment system
- [x] Add notifications logic

## ✅ Frontend Tasks
- [x] Display posts with likes/comments
- [x] Add follow/unfollow buttons
- [x] Add notification system UI
- [x] Test all interactions in UI

## 🎯 Goal
Full social interaction features are working.

Phase 8 - Media Upload #9
## 📌 Description
Enable media upload on backend and frontend.

## ✅ Backend Tasks
- [x] Implement file upload (image/video)
- [x] Store files locally
- [x] Create endpoint to serve media

## ✅ Frontend Tasks
- [x] Add file upload input on post creation
- [x] Display uploaded images/videos in feed
- [x] Test upload and retrieval

## 🎯 Goal
Users can upload and view media files.

Phase 9 - Reports & Admin #10
## 📌 Description
Enable reporting and admin moderation.

## ✅ Backend Tasks
- [x] Implement report system
- [x] Store report reason + timestamp
- [x] Create admin endpoints:
    - [x] View users
    - [x] Delete posts
    - [x] Ban users

## ✅ Frontend Tasks
- [x] Admin panel pages for user/post management
- [x] Display reports
- [x] Allow admin to delete/ban content

## 🎯 Goal
Admin panel fully functional for moderation.

Phase 10 - Testing #11
## 📌 Description
Write tests for backend and frontend to ensure reliability.

## ✅ Backend Tasks
- [x] Unit tests (services)
- [x] Integration tests (API)

## ✅ Frontend Tasks
- [x] Unit tests for components
- [x] Integration tests for pages and services

## 🎯 Goal
Both backend and frontend are tested and stable.

Phase 11 - Docker & Deployment #12
## 📌 Description
Containerize and deploy the full application.

## ✅ Backend Tasks
- [x] Create Dockerfile
- [x] Configure docker-compose (backend + postgres)
- [x] Run full system
- [x] Fix environment variables

## ✅ Frontend Tasks
- [x] Dockerize frontend
- [x] Add frontend to docker-compose
- [x] Ensure frontend can reach backend in Docker network
- [x] Test full stack deployment

## 🎯 Goal
Full system runs in Docker containers with frontend + backend communication.
