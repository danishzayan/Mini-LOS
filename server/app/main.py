from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.utils.exceptions import LOSException
from app.api.v1 import auth, loan, kyc, credit, admin



# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    Mini Loan Origination System API
    
    ## Features
    - Customer Onboarding (Loan Application)
    - KYC Verification
    - Credit Bureau Check
    - Eligibility Calculation
    - Admin Dashboard
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for custom exceptions
@app.exception_handler(LOSException)
async def los_exception_handler(request: Request, exc: LOSException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


# Include API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(loan.router, prefix="/api/v1")
app.include_router(kyc.router, prefix="/api/v1")
app.include_router(credit.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health_check": "/health",
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
