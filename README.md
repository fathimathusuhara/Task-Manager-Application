# TeamTask: Project Management

TeamTask is a project management application designed for teams that value aesthetics, speed, and intelligence. It combines a robust FastAPI backend with a blazing-fast React frontend to provide a seamless collaboration experience.

##  Key Features

- Interactive Dashboard: A vibrant, data-driven overview of your active tasks, overdue items, and project invitations.
- Enterprise RBAC: Role-Based Access Control (Admin vs. Member) ensuring secure project management and data integrity.
- Premium Aesthetics: A "stunning" Dark Blue theme featuring high-end glassmorphism, smooth micro-animations, and a responsive layout.
- Real-time Collaboration: Manage projects, assign tasks, and handle team invitations with an intuitive UI.

##  Tech Stack

### Backend
- Framework: FastAPI (Python)
- Database: PostgreSQL (Production) / SQLite (Development)
- ORM: SQLAlchemy
- Security: JWT Authentication, Passlib (Bcrypt)

### Frontend
- Framework: React (Vite)
- Styling: Vanilla CSS (Modern CSS Variables & Glassmorphism)
- Icons: Lucide React
- Routing: React Router v7

##  Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

##  Deployment

This project is optimized for **Railway** using the included `Dockerfile` and `railway.json`. 

### Automatic Deploy
1. Push this code to a GitHub repository.
2. Connect the repository to Railway.
3. Railway will automatically build and deploy the project using the multi-stage Docker build.

### Manual Deploy (CLI)
```bash
railway init
railway up
```

##  Project Structure
- `backend/`: FastAPI application and database schemas.
- `frontend/`: React application, assets, and styling.
- `Dockerfile`: Multi-stage build for production.
- `railway.json`: Deployment configuration.

---

Built by [Fathimathu Suhara]
