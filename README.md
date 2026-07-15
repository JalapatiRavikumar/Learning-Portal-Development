# 🎓 GVCC Secure Learning Portal 

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A state-of-the-art educational video platform built on the MERN stack. Designed with industry-grade security, the portal features **DRM screenshot protection**, **micro-time bookmarks**, and a beautifully integrated **YouTube ReactPlayer** ecosystem.

## ✨ Key Features

- **🛡️ Dynamic DRM Watermarking:** A floating overlay with the user's email shifts continuously across all video frames to prevent screen recording theft.
- **🔒 Blur & Tab Guard Security:** The video player immediately pauses and shields the content if the browser window loses focus (e.g., opening the Snipping Tool) or if the user switches browser tabs.
- **🚫 PrintScreen Blocking:** Attempts to screenshot are mitigated by overwriting the system clipboard.
- **⏯️ Smart Continue Watching:** The database remembers the exact playhead position for every single video so students can pick up right where they left off.
- **🔖 Micro-Time Bookmarking:** Add, edit, and delete detailed notes anchored to exact video timestamps. Jump back to specific video segments with a single click.
- **📺 YouTube Native Streaming:** Fully integrated with `react-player` to securely stream high-quality educational content directly from YouTube without CORS limitations.

---

## 📁 Project Architecture

The repository is structured as a full-stack monorepo:

```text
learning portal development_/
├── backend/          ← Express + MongoDB REST API (Running on port 5000)
│   ├── models/       ← Mongoose Schemas (User, Video, Bookmark)
│   ├── seed/         ← Database seeding scripts
│   └── server.js     ← Express app entry point
└── frontend/         ← React + Vite + Tailwind CSS (Running on port 5173)
    ├── src/
    │   ├── components/ ← UI Components (VideoRoom, SecurityShield, etc.)
    │   ├── hooks/      ← Custom React Hooks (useSecurity, useWatchHistory)
    │   └── App.jsx     ← Main application router and state
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Copy the example environment file and add your MongoDB connection string:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.mongodb.net/gvcc_learning
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

**Seed the Database:** (Highly recommended)
Populates the database with 6 comprehensive web development courses, bookmarks, and demo accounts.
```bash
npm run seed
```

**Start the API:**
```bash
npm run dev     # Starts with nodemon for auto-reloading
# or
npm start       # Production mode
```
*The API will be live at `http://localhost:5000`*

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*Visit the application at: **http://localhost:5173***

> **💡 Note:** The Vite dev server is configured to automatically proxy all `/api/*` requests to the backend on port 5000. If the backend is offline, the frontend gracefully falls back to seeded localStorage data!

---

## 🔑 Demo Login Credentials

Once the application is running, use these accounts to explore the platform:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `alex.mercer@gvcc.edu` | `student123` |
| **Admin** | `admin@gvcc.edu` | `admin123456` |

---

## 📡 REST API Endpoints

The backend is fully documented and structured following RESTful principles.

### Users & Auth
- `POST /api/users/register` — Register a new student
- `POST /api/users/login` — Authenticate and receive a signed JWT
- `GET /api/users/profile` — Fetch current user profile (Auth required)

### Video & History
- `GET /api/videos` — List all available courses
- `GET /api/videos/:id` — Get single video details
- `PUT /api/users/history` — Upsert user watch progress (Auth required)
- `GET /api/users/history` — Fetch all watch history (Auth required)

### Bookmarks
- `GET /api/bookmarks` — List bookmarks (Supports `?videoId` filtering) (Auth required)
- `POST /api/bookmarks` — Create a new micro-time bookmark (Auth required)
- `PUT /api/bookmarks/:id` — Update an existing bookmark (Auth required)
- `DELETE /api/bookmarks/:id` — Remove a bookmark (Auth required)

---

## 🛠️ Tech Stack

**Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Security:** JSON Web Tokens (JWT), bcryptjs, Helmet, express-rate-limit

**Frontend**
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS v4
- **Video Engine:** react-player
- **HTTP Client:** Axios
- **Icons:** Lucide React
