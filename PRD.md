# Product Requirements Document (PRD)

## Project Name
Killuadology Learning Platform

## Document Version
- Version: 1.0
- Date: 2026-05-26
- Author: Project Team

## Overview
Killuadology is a bilingual (English/Arabic) online learning platform that enables students to browse, purchase, and access educational courses, lectures, lessons, and quizzes. It includes a role-based admin experience for managing courses, lessons, notifications, purchases, quiz submissions, and platform settings.

## Goals
- Provide learners with a simple, localized learning experience in English and Arabic.
- Support user registration, authentication, profile management, and secure access to purchased content.
- Allow users to discover courses by subject and view lesson-level content.
- Enable in-app purchase workflows for courses, lessons, and academic subjects.
- Offer administrators full control over content, user accounts, purchases, notifications, quiz review, and platform configuration.

## Stakeholders
- Students / Learners
- Platform Administrators
- Course Authors / Content Managers
- Product Owners

## User Personas
1. Student
   - Needs an easy way to discover courses, access purchased lessons, and track notifications.
   - Expects a responsive, multilingual interface with clear purchase flows.
2. Admin
   - Needs tools to manage course catalogs, lesson content, purchases, user accounts, and settings.
   - Requires analytics, notifications management, and support for uploading PDF content.

## User Roles
- Guest: browse courses, register, login.
- Student: purchase content, access lessons, complete quizzes, view notifications, manage profile.
- Admin: manage courses, lessons, purchases, notifications, quiz submissions, settings, users.

## Functional Requirements

### 1. Authentication & User Management
- Register with full name, email, phone number, and password.
- Login and logout with JWT-based authentication.
- Maintain session security and prevent concurrent login conflicts.
- Update user profile information and password.
- Allow admin users to view and manage user accounts.

### 2. Course Discovery
- List published courses for browsing.
- Support filtering courses by subject and semester.
- Display course details including title, description, subject, and pricing.
- Provide course landing pages with a list of available lessons.

### 3. Lesson & Quiz Access
- Display lesson content within a course context.
- Allow access to lesson-level material for purchased items.
- Support quiz submission per lesson.
- Provide retrieval of the learner's quiz submission status and results.

### 4. Purchase Workflow
- Allow authenticated users to purchase:
  - individual courses
  - individual lessons
  - academic subjects or semesters
- Store purchase records and support purchase approval workflow.
- Enable students to view their approved purchases and purchased courses.

### 5. Notifications
- Display notifications to users in the main application.
- Allow admins to create, list, and delete notifications.

### 6. Admin Capabilities
- Dashboard overview for admin analytics and status.
- Manage courses: create, update, delete.
- Manage lessons: list, create, update, delete within courses.
- Manage purchases: review, approve/reject, delete.
- Manage quiz submissions: review submitted quizzes.
- Manage notifications: create and delete messages to users.
- Manage platform settings via a central settings page.
- Upload PDF content for course resources.

### 7. Localization & Theming
- Provide English and Arabic language support.
- Support RTL layout for Arabic and LTR for English.
- Offer a theme toggle between dark and light modes.

## Non-Functional Requirements
- Responsive web experience for desktop and mobile.
- Secure API with protected routes and role-based access controls.
- Reliable database connectivity to MongoDB.
- Clean separation between frontend and backend services.
- Use environment variables for sensitive configuration.
- Support deployment on Vercel or similar cloud hosting.

## Technical Architecture

### Frontend
- React 19 with Vite
- React Router DOM for routing
- Axios for HTTP requests
- React i18next for localization
- Context API for auth state management
- CSS modules / styles for pages and components

### Backend
- Node.js + Express
- MongoDB with Mongoose ODM
- JWT auth with `jsonwebtoken`
- Password hashing with `bcrypt`
- File upload support with `multer`
- Email capabilities via `nodemailer`
- Middleware for auth, admin protection, and file upload handling

### Data Models
- User
- Course
- Lesson
- Purchase
- Notification
- QuizSubmission
- Settings
- File (uploaded content)

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/auth/my-courses`

### Courses
- `GET /api/courses`
- `GET /api/courses/subjects`
- `GET /api/courses/:id/lessons`
- `POST /api/courses/:courseId/lessons/:lessonId/quiz/submit`
- `GET /api/courses/:courseId/lessons/:lessonId/quiz/my-submission`

### Purchases
- `POST /api/purchases`
- `GET /api/purchases/my-purchases`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications`
- `DELETE /api/notifications/:id`

### Admin
- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PUT /api/admin/courses/:id`
- `DELETE /api/admin/courses/:id`
- `GET /api/admin/courses/:id/lessons`
- `POST /api/admin/courses/:id/lessons`
- `PUT /api/admin/lessons/:lessonId`
- `DELETE /api/admin/lessons/:lessonId`
- `GET /api/admin/purchases`
- `PUT /api/admin/purchases/:id`
- `DELETE /api/admin/purchases/:id`
- `GET /api/admin/quiz-submissions`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/password`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/upload-pdf`

### File Serving
- `GET /uploads/:type/:filename`
- `GET /api/uploads/:type/:filename`

## Environment Variables
- `MONGO_URI`
- `JWT_SECRET`
- `PORT` (optional)
- `VERCEL` (platform detection)
- Any email service variables used by `nodemailer`

## Deployment
- Frontend and backend are structured for deployment on Vercel.
- Backend can run standalone with Node.js if needed.
- Ensure MongoDB Atlas or equivalent is configured with access from deployment.

## Success Metrics
- Users can register, login, and access purchased content successfully.
- Admin users can manage courses, lessons, purchases, notifications, and settings.
- The system supports English and Arabic with correct layout direction.
- Purchases can be recorded and approved.
- Quiz submissions can be submitted and reviewed.

## Assumptions
- The first registered user or designated admin email becomes an admin account.
- Email and PDF upload workflows are available but may require external provider configuration.
- The app stores active user sessions and limits simultaneous logins.

## Risks
- Session management must correctly handle concurrent login/logout flows.
- Localization requires careful RTL UI handling for Arabic.
- File uploads and stored PDFs need secure access control.
