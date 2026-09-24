# PathForge 🎓💼

### Premium Academia–Industry Collaboration Platform for Internships & Placements

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-GitHub%20Pages-blue?style=for-the-badge\&logo=github)](https://kkr-kkreddy-24a31a05kd.github.io/PathForge/)
[![Backend API](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge\&logo=render)](https://pathforge-api-ngmj.onrender.com/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge\&logo=mongodb)](https://www.mongodb.com/atlas)
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-61DAFB?style=for-the-badge\&logo=react)](https://react.dev/)

---

## 🌐 Live Application

### 🚀 Website

**https://kkr-kkreddy-24a31a05kd.github.io/PathForge/**

This is the URL to share with users, teachers, recruiters, and evaluators.

### 🔌 Backend API

**https://pathforge-api-ngmj.onrender.com/**

The Render URL is the backend API service. It is not the frontend website.

### ❤️ Backend Health Check

**https://pathforge-api-ngmj.onrender.com/health**

---

# 📌 1. Project Overview

**PathForge** is a full-stack Academia–Industry Collaboration Platform designed to connect students, companies, and academic administrators through a unified internship and placement ecosystem.

The platform provides:

* Student internship discovery
* Skill-based internship matching
* Resume compatibility checking
* Internship applications
* Company internship posting
* Candidate management
* Interview scheduling
* Admin company verification
* Recruitment analytics
* Real-time notifications
* Role-based access control

The system is designed using a modern MERN-based architecture with Socket.IO for real-time communication.

---

# 🎯 2. Project Objectives

1. Connect students with relevant internship opportunities.
2. Help students understand their skill alignment with internship requirements.
3. Allow companies to publish and manage internship opportunities.
4. Provide recruiters with ranked candidate information.
5. Allow administrators to verify companies.
6. Simplify interview scheduling.
7. Provide real-time application and interview notifications.
8. Provide analytics for companies and administrators.

---

# ⭐ 3. Key Features

### 👨‍🎓 Student

* Student registration and login
* Student profile management
* Skill management
* Resume information
* Internship discovery
* Search and filtering
* Skill match percentage
* Resume match checker
* Internship applications
* Application tracking
* Interview scheduling
* Interview confirmation
* Notifications
* Dark/light theme

### 🏢 Company

* Company registration
* Administrative verification
* Internship posting
* Internship editing
* Internship status management
* Applicant management
* Candidate ranking
* Application status updates
* Interview slot proposals
* Meeting links
* Recruitment analytics

### 👑 Administrator

* Platform dashboard
* Company verification
* Student/company directory
* Internship monitoring
* Application analytics
* Placement funnel
* Skill-demand analytics
* Platform statistics

---

# 🧠 4. Skill Matching / ATS Engine

PathForge uses a deterministic skill-matching algorithm.

The system:

1. Normalizes required skills.
2. Compares them against student profile skills.
3. Searches resume text when a declared skill is unavailable.
4. Calculates the percentage of matched skills.
5. Identifies missing skills.
6. Provides recommendations.

### Match Score

```text
Match Score =
(Matched Required Skills / Total Required Skills) × 100
```

Example:

```text
Required Skills: 5
Matched Skills: 4

Match Score = 4 / 5 × 100
             = 80%
```

### Feedback

* **80%+** — Excellent profile alignment
* **50–79%** — Strong match
* **Below 50%** — Additional skill development recommended

The algorithm is deterministic, explainable, fast, and does not require an external AI API.

---

# 📄 5. Resume Checker

Students can check their resume compatibility before applying.

The Resume Checker provides:

* Match percentage
* Matched skills
* Missing skills
* Skill recommendations
* Internship-specific analysis

Students can test their resume against available internship opportunities.

---

# 📅 6. Interview Management

Companies can propose multiple interview slots.

Workflow:

```text
Company
   ↓
Select Candidate
   ↓
Propose Interview Slots
   ↓
Student Receives Notification
   ↓
Student Selects Slot
   ↓
Interview Confirmed
   ↓
Meeting Link Available
```

Supported interview information includes:

* Multiple proposed slots
* Selected interview slot
* Meeting link
* Interview type
* Interview notes
* Interview status

---

# 🔔 7. Real-Time Notifications

PathForge uses **Socket.IO** for real-time notifications.

Notifications can be generated for:

* Company verification
* Internship applications
* Application status updates
* Interview invitations
* Interview confirmations

Notifications are also persisted in MongoDB so users can retrieve them through REST APIs.

---

# 🏗️ 8. System Architecture

```text
                 ┌─────────────────────┐
                 │    GitHub Pages     │
                 │ React + Vite + SPA  │
                 └──────────┬──────────┘
                            │
                     HTTPS / REST
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Render Backend    │
                 │ Node + Express      │
                 │ Socket.IO           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   MongoDB Atlas     │
                 │     Database        │
                 └─────────────────────┘
```

### Deployment

```text
Frontend
React + Vite
      ↓
GitHub Pages

Backend
Node.js + Express
      ↓
Render

Database
MongoDB
      ↓
MongoDB Atlas
```

---

# 💻 9. Technology Stack

## Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 18         | User interface          |
| Vite             | Build tool              |
| Tailwind CSS     | UI styling              |
| React Router     | Client-side routing     |
| Axios            | API communication       |
| Socket.IO Client | Real-time communication |
| Recharts         | Analytics charts        |
| Lucide React     | Icons                   |

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express.js | REST API                  |
| MongoDB    | Database                  |
| Mongoose   | Database ODM              |
| Socket.IO  | Real-time events          |
| JWT        | Authentication            |
| bcrypt.js  | Password hashing          |
| Nodemailer | Email functionality       |
| CORS       | Cross-origin security     |
| dotenv     | Environment configuration |

---

# 🔐 10. Authentication & Security

PathForge implements:

* JWT authentication
* Password hashing using bcrypt
* Role-based access control
* Protected API routes
* Company ownership validation
* Admin authorization
* CORS configuration
* Login/register rate limiting
* Protected student/company resources
* Database credential protection

Roles:

```text
Student
Company
Administrator
```

---

# 🗄️ 11. Database

PathForge uses MongoDB Atlas.

Core collections include:

```text
users
internships
applications
interviews
notifications
```

Important relationships:

```text
User
 ├── Internships
 ├── Applications
 ├── Interviews
 └── Notifications

Internship
 └── Applications

Application
 └── Interview
```

A unique application constraint prevents a student from applying multiple times to the same internship.

---

# 📡 12. REST API

### Base URL

```text
https://pathforge-api-ngmj.onrender.com/api
```

### Health

```http
GET /
GET /health
GET /api/health
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
```

### Internships

```http
GET    /api/internships
GET    /api/internships/:id
POST   /api/internships
PUT    /api/internships/:id
DELETE /api/internships/:id
```

### Applications

```http
POST  /api/applications/apply/:internshipId
GET   /api/applications/my-applications
GET   /api/applications/internship/:internshipId/applicants
PATCH /api/applications/:id/status
POST  /api/applications/check-resume-score
```

### Interviews

```http
POST  /api/interviews/propose
PATCH /api/interviews/:id/confirm
GET   /api/interviews/upcoming
```

### Notifications

```http
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

# 👥 13. Role Access

| Feature             | Guest | Student | Company | Admin |
| ------------------- | :---: | :-----: | :-----: | :---: |
| View Website        |   ✅   |    ✅    |    ✅    |   ✅   |
| Browse Internships  |   ✅   |    ✅    |    ✅    |   ✅   |
| Apply               |   ❌   |    ✅    |    ❌    |   ❌   |
| Resume Checker      |   ❌   |    ✅    |    ❌    |   ❌   |
| Track Applications  |   ❌   |    ✅    |    ❌    |   ❌   |
| Post Internship     |   ❌   |    ❌    |    ✅    |   ✅   |
| Manage Candidates   |   ❌   |    ❌    |    ✅    |   ✅   |
| Schedule Interviews |   ❌   |    ❌    |    ✅    |   ✅   |
| Company Approval    |   ❌   |    ❌    |    ❌    |   ✅   |
| Platform Analytics  |   ❌   |    ❌    |    ❌    |   ✅   |

---

# ⚙️ 14. Local Installation

## Requirements

* Node.js 18+
* npm 9+
* Git
* MongoDB Atlas account for production database

## Clone

```powershell
git clone https://github.com/kkr-kkreddy-24a31a05kd/PathForge.git
cd PathForge
```

## Install Dependencies

```powershell
npm --prefix server install
npm --prefix client install
```

## Backend Environment

Create:

```text
server/.env
```

Example:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
SEED_DEMO_DATA=true
```

## Start Backend

```powershell
npm --prefix server run dev
```

## Start Frontend

Open another terminal:

```powershell
npm --prefix client run dev
```

Local frontend:

```text
http://localhost:5173/PathForge/
```

Local backend:

```text
http://localhost:5000/
```

---

# 🚀 15. Production Deployment

## Frontend

The frontend is deployed using GitHub Pages.

```text
https://kkr-kkreddy-24a31a05kd.github.io/PathForge/
```

Deployment command:

```powershell
cd client
npm run deploy
```

## Backend

The backend is deployed using Render.

```text
https://pathforge-api-ngmj.onrender.com/
```

Health check:

```text
https://pathforge-api-ngmj.onrender.com/health
```

## Database

MongoDB Atlas is used as the production database.

---

# 🌐 16. Final Deployment Links

### ⭐ Main Website

**https://kkr-kkreddy-24a31a05kd.github.io/PathForge/**

### 🔌 Backend API

**https://pathforge-api-ngmj.onrender.com/**

### ❤️ Backend Health

**https://pathforge-api-ngmj.onrender.com/health**

### 📦 GitHub Repository

**https://github.com/kkr-kkreddy-24a31a05kd/PathForge**

> **Important:** Share the GitHub Pages URL as the PathForge website. The Render URL is only the backend API.

---

# 🎓 17. B.Tech Project Information

**Project:** PathForge

**Title:**
Premium Academia–Industry Collaboration Platform for Internships & Placements

**Degree:**
Bachelor of Technology — Computer Science & Engineering

**Domain:**

* Full-Stack Web Development
* HRTech
* Internship & Placement Management
* Applied NLP / Information Retrieval
* Real-Time Web Applications

**Core Technologies:**

```text
React
Node.js
Express
MongoDB
Socket.IO
JWT
Tailwind CSS
Vite
```

---

# 🎤 18. Viva Questions

### Why did you use React?

React provides a component-based architecture for building a responsive single-page application.

### Why MongoDB?

MongoDB provides a flexible document-based structure suitable for users, internships, applications, interviews, and notifications.

### Why JWT?

JWT provides stateless authentication between the frontend and backend.

### Why Socket.IO?

Socket.IO enables real-time application and interview notifications without requiring users to refresh the page.

### How does the matching system work?

The system normalizes required skills and compares them with student profile skills and resume text to calculate a percentage match.

### How is duplicate application prevented?

A unique database constraint is used on the internship and student combination.

### How are companies secured?

Company access is protected through authentication, role authorization, and ownership checks.

### What happens when a company posts an internship?

The company creates an internship, students can discover it, and eligible students can apply. Applications are stored with match information for recruiter review.

---

# ⚠️ 19. Current Limitations

* Resume matching currently works with text rather than directly parsing PDF files.
* Video interviews use external meeting links such as Google Meet or Zoom.
* Self-service password recovery is not currently implemented.

---

# 🔮 20. Future Enhancements

* AI-powered resume parsing
* PDF resume extraction
* In-app recruiter/student messaging
* Online coding assessments
* Automated offer-letter generation
* Advanced recommendation engine
* Email/SMS notifications
* Campus placement drive management

---

# 🏆 21. Project Highlights

PathForge demonstrates:

* Full-stack application development
* REST API design
* Authentication and authorization
* MongoDB data modeling
* Real-time WebSocket communication
* Role-based security
* Algorithmic skill matching
* Internship management
* Interview scheduling
* Cloud deployment
* Responsive UI development

---

# 📜 License

This project was developed as a B.Tech Computer Science & Engineering academic project.

© 2026 PathForge — Developed with academic rigor and modern software engineering practices.
