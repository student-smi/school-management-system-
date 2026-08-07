# College Student Management System 🎓

A full-stack college management system built with **FastAPI + React + Supabase PostgreSQL**.

## Features

- **Two roles**: Admin (full CRUD) + Student (read-only)
- **JWT Authentication**
- **Admin**: Manage Students, Classes, Attendance, Exams, Results
- **Student**: View Attendance %, Exams, Results, Profile
- **Modern UI**: Tailwind CSS with glassmorphism, animations, dark sidebar

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, React Router 6, Axios, Tailwind CSS |
| Backend  | FastAPI, SQLAlchemy, Pydantic, Passlib |
| Auth     | JWT (python-jose) |
| Database | Supabase PostgreSQL |

---

## Project Structure

```
AI-attend/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── .env
│   ├── requirements.txt
│   ├── auth/           # JWT handler + dependencies
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── crud/           # DB operations
│   └── routes/         # API endpoints
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api/        # Axios instance
        ├── context/    # Auth context
        ├── components/ # Sidebar, Table, Modal, StatCard
        └── pages/
            ├── Login.jsx
            ├── admin/  # Dashboard, Students, Classes, Attendance, Exams, Results
            └── student/# Dashboard, Attendance, Exams, Results, Profile
```

---

## Setup Instructions

### Step 1: Supabase Database

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → New Query
3. Paste the contents of `schema.sql` and click **Run**
4. Copy your **Project URL** and **Database Password**

---

### Step 2: Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env file:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
# JWT_SECRET_KEY=your-long-random-secret-key

# Start the server
uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs (Swagger): http://localhost:8000/docs

---

### Step 3: Create Admin User

Run this in Supabase SQL Editor to create your admin account:

```sql
-- First create the bcrypt hash for "admin123" in Python:
-- from passlib.context import CryptContext
-- ctx = CryptContext(schemes=["bcrypt"])
-- print(ctx.hash("admin123"))

INSERT INTO users (email, password, role) VALUES
('admin@college.com', '<bcrypt_hash_here>', 'admin');
```

Or use the seed data already in schema.sql (password: `admin123`).

---

### Step 4: Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# The .env is already configured for localhost
# Edit frontend/.env if your backend URL is different

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Default Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@college.com | admin123 |

---

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/login` | Public |
| GET/POST/PUT/DELETE | `/students/` | Admin |
| GET | `/students/me` | Student |
| GET/POST/PUT/DELETE | `/classes/` | Admin |
| GET/POST/PUT/DELETE | `/attendance/` | Admin |
| GET | `/attendance/me` | Student |
| GET/POST/PUT/DELETE | `/exams/` | Admin |
| GET | `/exams/` | Both |
| GET/POST/PUT/DELETE | `/results/` | Admin |
| GET | `/results/me` | Student |

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=1440
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```
