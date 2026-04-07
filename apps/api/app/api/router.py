from fastapi import APIRouter

from app.api.routes import assets, catalog, dashboard, employees, health, organizations

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
