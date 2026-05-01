from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
import models
from routers import users, projects, tasks

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://127.0.0.1:5173",
    "*" # For production/deployment simplicity
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse

# Include Routers
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)

# Mount uploads for profile photos
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Mount static files (React Frontend built files)
frontend_path = os.path.join(os.path.dirname(__file__), "static")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Catch-all route for React Router
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Skip for API routes (though they should be handled by routers above)
    if full_path.startswith("api/"):
        return {"detail": "Not Found"}
        
    index_path = os.path.join(frontend_path, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    # Fallback if static files are not built yet
    return {"status": "Backend is running. Frontend static files not found in /static."}
