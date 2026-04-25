# 🚀 HireSense – Career Intelligence Platform

**HireSense** is a high-end AI-powered career intelligence system designed to bridge the gap between candidates and their dream jobs. It uses advanced parsing and scoring algorithms to analyze resumes, provide actionable feedback, and match candidates with high-tier job opportunities.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black?style=for-the-badge)

---

## ✨ Key Features

- **🧠 Intelligent Resume Parsing**: Automatically extracts skills, experience, and education from PDF resumes using `pdf-parse` and NLP techniques.
- **📊 ATS Scoring Engine**: Provides a comprehensive score (0-100) based on industry standards, analyzing skill density and experience relevance.
- **🎯 Dynamic Job Matching**: Matches your profile against a curated database of roles from top companies like **Stripe**, **Linear**, and **Vercel**.
- **📈 Analytical Dashboard**: A "Linear-style" glassmorphic UI displaying technical skill breakdowns and improvement suggestions.
- **🛡️ Secure Career Vault**: JWT-protected authentication system with encrypted storage for your professional data.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Custom Dark Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Security**: JWT (JSON Web Tokens) & BcryptJS
- **File Handling**: Multer (PDF Processing)
- **Architecture**: Clean Repository Pattern

---

## 📂 Project Structure

```text
HireSense/
├── backend/            # Express API, Models, Services & Controllers
│   ├── src/
│   │   ├── models/     # Mongoose Schemas
│   │   ├── services/   # Business Logic (Scoring, Parsing)
│   │   ├── routes/     # API Endpoints
│   │   └── config/     # Database & Env Setup
│   └── server.js       # Entry point
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Full-page Views
│   │   └── context/    # Auth & Global State
│   └── vite.config.ts  # Build & Proxy configuration
└── diagrams/           # System Architecture (UML, ERD, Sequence)
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/pranjal-ogg/HireSense.git
cd HireSense
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5005
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_secret
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Seed Database (Optional)
To populate the app with sample jobs and an admin user:
```bash
cd backend
node src/scripts/seed.js
```

---

## 📐 Architecture Diagrams

The system architecture is documented using Mermaid.js and can be found in the following files:
- 📊 [ER Diagram](./ErDiagram.md)
- 🏗️ [Class Diagram](./classDiagram.md)
- 🔄 [Sequence Diagram](./sequenceDiagram.md)
- 📋 [Use Case Diagram](./useCaseDiagram.md)

---

## 🌐 Deployment

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Env Variable**: `VITE_API_BASE_URL` (Point to your Render API)

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

---
