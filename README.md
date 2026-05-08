# 🎓 Vardhman School Management System

A full-stack School Management System built with **React (CRA) + FastAPI + SQLite**.
Demo-ready, clean UI, role-based access for Admin and Students.

---

## 📁 Project Structure 

```
vardhman-school-v2/
│
├── backend/                        ← Python FastAPI backend
│   ├── main.py                     ← All routes + DB logic
│   ├── requirements.txt
│   └── vardhman.db                 ← Auto-created SQLite DB
│
└── frontend/                       ← React CRA frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js                ← Entry point
    │   ├── App.js                  ← All routes (React Router v6)
    │   ├── api/
    │   │   └── index.js            ← All Axios API calls
    │   ├── context/
    │   │   └── AuthContext.js      ← Global auth state
    │   ├── components/
    │   │   ├── Sidebar.js/css      ← Role-based sidebar nav
    │   │   ├── Layout.js/css       ← Page wrapper with sidebar
    │   │   ├── StatCard.js/css     ← Reusable stat widget
    │   │   └── ProtectedRoute.js   ← Auth guard
    │   ├── pages/
    │   │   ├── LoginPage.js/css         ← Unified login (role tabs)
    │   │   ├── AdminDashboard.js/css    ← Stats + add/delete students
    │   │   ├── AttendancePage.js/css    ← Mark + view attendance
    │   │   ├── ResultsPage.js/css       ← Add/view marks & grades
    │   │   ├── NoticesPage.js/css       ← Post & read notices
    │   │   ├── FeesPage.js/css          ← Fee records & payments
    │   │   ├── StudentDashboard.js/css  ← Student profile
    │   │   ├── StudentAttendance.js/css ← Student's own attendance
    │   │   └── StudentResults.js/css    ← Student's report card
    │   └── styles/
    │       └── global.css          ← CSS variables + reusable classes
    └── package.json
```

---

## 🚀 Setup Instructions

### Backend

```bash
# Step 1 — Navigate to backend
cd vardhman-school-v2/backend

# Step 2 — (Optional) Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Step 3 — Install dependencies
pip install fastapi uvicorn

# Step 4 — Start server
python -m uvicorn main:app --reload --port 8000
```

✅ API running at: **http://localhost:8000**
✅ Swagger docs at: **http://localhost:8000/docs**

---

### Frontend

```bash
# Step 1 — Navigate to frontend
cd vardhman-school-v2/frontend

# Step 2 — Install packages
npm install

# Step 3 — Start dev server
npm start
```

✅ App running at: **http://localhost:3000**

---

## 🔐 Login Credentials

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@vardhman.edu       | admin123     |
| Student | aarav@vardhman.edu       | student123   |
| Student | priya@vardhman.edu       | student123   |
| Student | rohan@vardhman.edu       | student123   |

---

## 🔗 API Endpoints

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| POST   | `/login`                         | Login for admin or student      |
| GET    | `/students`                      | Get all students                |
| POST   | `/students`                      | Add new student                 |
| DELETE | `/students/{id}`                 | Delete student                  |
| GET    | `/attendance`                    | Get attendance records          |
| POST   | `/attendance/bulk`               | Mark bulk attendance for a date |
| GET    | `/attendance/summary/{id}`       | Get student attendance summary  |
| GET    | `/results`                       | Get all results                 |
| POST   | `/results`                       | Add/update a result             |
| DELETE | `/results/{id}`                  | Delete a result                 |
| GET    | `/notices`                       | Get all notices                 |
| POST   | `/notices`                       | Post a new notice               |
| DELETE | `/notices/{id}`                  | Delete a notice                 |
| GET    | `/fees`                          | Get fee records                 |
| POST   | `/fees`                          | Add a fee record                |
| PATCH  | `/fees/{id}`                     | Mark fee as paid/unpaid         |
| DELETE | `/fees/{id}`                     | Delete a fee record             |

---

## ✨ Features

### 👨‍💼 Admin
| Feature | Description |
|---------|-------------|
| Dashboard | Stats (students, classes, year) + quick nav cards |
| Students | Add with validation, searchable list, delete |
| Attendance | Toggle present/absent per student, bulk save, view history by date |
| Results | Enter subject marks, auto grade (A+→F), progress bars, filter by student/exam |
| Notices | Post announcements, delete old ones |
| Fees | Add fee records, mark paid, filter by student/status, summary cards |

### 👨‍🎓 Student
| Feature | Description |
|---------|-------------|
| Profile | Full profile card with Student ID |
| Attendance | Circular % chart, present/absent count, full log |
| Results | Scorecard banner, subject cards with grade bars, exam filter |
| Notices | Read all school announcements |
| Fees | View personal fee history and payment status |

---

## 🛠 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, React Router v6, Axios        |
| Backend  | Python, FastAPI, Uvicorn                |
| Database | SQLite (auto-created, no setup needed)  |
| Styling  | Custom CSS with CSS variables           |
| Fonts    | Google Fonts — Playfair Display + DM Sans |

---

## 🌐 Free Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| **Render.com** | FastAPI backend | render.com |
| **Netlify / Vercel** | React frontend | netlify.com |

Before deploying, set your backend URL in frontend:
```
# frontend/.env
REACT_APP_API_URL=https://your-backend.onrender.com
```
