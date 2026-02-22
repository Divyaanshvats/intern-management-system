# 🎓 Intern Management System (IMS) - Algo8.ai

A professional, AI-powered intern performance management platform built for **Algo8.ai**. This system automates the evaluation lifecycle, provides intelligent performance analysis using Google Gemini AI, and generates branded PDF reports.

---

## 🚀 Live Demo
**Production URL**: [intern-management-system-algo8.vercel.app](https://intern-management-system-algo8.vercel.app/)

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Axios, Lucide Icons.
- **Backend**: FastAPI (Python 3.12).
- **Database**: PostgreSQL (via Supabase) with SQLAlchemy ORM.
- **AI Engine**: Google Gemini 1.5 Flash.
- **Deployment**: Vercel (Frontend + Serverless Functions).
- **Reporting**: html2canvas & jsPDF for branded report generation.

---

## ✨ Key Features

### 1. Branded Corporate UI
- **Glassmorphic Design**: A modern, premium interface using semi-transparent elements and vibrant gradients.
- **Algo8 Branding**: Fully customized with Algo8.ai logos, colors, and email domain validation.

### 2. Intelligent Performance Analysis
- **AI-Powered Reports**: Automatically generates comprehensive professional summaries based on Manager, Intern, and HR feedback.
- **Workflow State Management**: Multi-step evaluation process (Draft → Pending Intern → Pending HR → Completed).

### 3. Role-Based Access Control
- **Manager Dashboard**: Create evaluations, track intern progress, and view performance charts.
- **Intern Dashboard**: Review evaluations and provide self-feedback.
- **HR Dashboard**: Finalize reviews, adjust ratings, and manage user activations/deactivations.

### 4. Enterprise Security
- **Invite Code System**: High-privileged registration (`Manager`/`HR`) requires the secret key: `ALGO8_2024`.
- **User Management**: HR can instantly deactivate access for any user.
- **Secure Authentication**: JWT-based auth with `bcrypt` password hashing and `NullPool` database connection management for cloud stability.

---

## 📂 Project Structure

```text
├── api/                # Vercel entry point
├── backend/            # FastAPI Backend
│   ├── main.py         # API routes & logic
│   ├── models.py       # DB Schema
│   ├── database.py     # DB Connection & Pooling
│   ├── auth.py         # JWT & Bcrypt Logic
│   └── ai_service.py   # Google Gemini Integration
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── pages/      # Dashboards & Auth pages
│   │   ├── components/ # Reusable UI components
│   │   └── services/   # API & PDF services
└── requirements.txt    # Production Python dependencies
```

---

## ⚙️ Local Setup

### Backend Root
1. Install Python 3.12.
2. Navigate to `/backend`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Create a `.env` file with:
   - `DATABASE_URL=sqlite:///./ims.db` (for local)
   - `GEMINI_API_KEY=your_key`
   - `SECRET_KEY=your_secret`
5. Run: `uvicorn main:app --reload`

### Frontend Root
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with:
   - `VITE_API_URL=http://localhost:8000`
4. Run: `npm run dev`

---

## ☁️ Production Configuration (Vercel)

The project is optimized for Vercel deployment. Ensure the following Environment Variables are set in the Vercel Dashboard:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres Connection String |
| `GEMINI_API_KEY` | Google AI API Key |
| `SECRET_KEY` | JWT Signing Secret |
| `REGISTRATION_KEY` | '-------' |
| `VITE_API_URL` | `-----` |

---

## 🏆 Final Audit Certification
The project has undergone a full production audit ensuring:
- ✅ **Stability**: `NullPool` implemented for serverless DB connections.
- ✅ **Compatibility**: JSON-based API bodies.
- ✅ **Security**: Normalized invite code verification with whitespace stripping.
- ✅ **Reliability**: Locked to stable Google Gemini and Bcrypt versions.

**Developed for Algo8.ai - Performance Managed with Intelligence.**

