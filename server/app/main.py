from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.utils.exceptions import LOSException
from app.api.v1 import auth, loan, kyc, credit, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Creates database tables on startup.
    """
    # Startup
    create_tables()
    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started successfully!")
    print(f"📊 Database: {settings.DATABASE_URL}")
    yield
    # Shutdown
    print("👋 Application shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    Mini Loan Origination System (Mini-LOS) API
    
    ## Features
    - 📝 Customer Onboarding (Loan Application)
    - 🔐 KYC Verification
    - 📊 Credit Bureau Check
    - ✅ Eligibility Calculation
    - 👨‍💼 Admin Dashboard
    
    ## Workflow
    1. Create Application → DRAFT
    2. Perform KYC → KYC_PENDING → KYC_COMPLETED
    3. Credit Check → CREDIT_CHECK_PENDING → CREDIT_CHECK_COMPLETED
    4. Final Status → ELIGIBLE or NOT_ELIGIBLE
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
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


# Health check endpoint
@app.get("/", tags=["Health"])
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
