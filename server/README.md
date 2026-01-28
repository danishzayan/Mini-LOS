# Mini-LOS (Mini Loan Origination System)

A FastAPI-based backend for a simplified Loan Origination System with workflow management, KYC verification, credit bureau checks, and eligibility calculation.

## 🏗️ Project Structure

```
server/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py           # Application settings
│   │   ├── database.py         # Database configuration
│   │   ├── security.py         # JWT authentication
│   │   └── enums.py            # Workflow states
│   │
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── loan_application.py # Loan application model
│   │   ├── kyc.py              # KYC result model
│   │   └── credit.py           # Credit & eligibility models
│   │
│   ├── schemas/
│   │   ├── user.py             # User Pydantic schemas
│   │   ├── loan_application.py # Loan application schemas
│   │   ├── kyc.py              # KYC schemas
│   │   └── credit.py           # Credit & eligibility schemas
│   │
│   ├── services/
│   │   ├── workflow_service.py     # Workflow state management
│   │   ├── kyc_service.py          # KYC verification (mock)
│   │   ├── credit_bureau_service.py # Credit bureau (mock CIBIL)
│   │   └── eligibility_service.py   # Eligibility calculation
│   │
│   ├── api/v1/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── loan.py             # Loan application endpoints
│   │   ├── kyc.py              # KYC endpoints
│   │   ├── credit.py           # Credit check endpoints
│   │   └── admin.py            # Admin dashboard endpoints
│   │
│   └── utils/
│       ├── validators.py       # Validation utilities
│       └── exceptions.py       # Custom exceptions
│
├── alembic/                    # Database migrations
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. Access Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📋 Workflow States

```
DRAFT → KYC_PENDING → KYC_COMPLETED → CREDIT_CHECK_PENDING → CREDIT_CHECK_COMPLETED → ELIGIBLE
                ↓                                     ↓                                    ↓
          NOT_ELIGIBLE                          NOT_ELIGIBLE                          NOT_ELIGIBLE
```

## 🔌 API Endpoints

### Loan Application

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/loan/create` | Create new loan application |
| GET | `/api/v1/loan/{id}` | Get application details |
| PUT | `/api/v1/loan/{id}` | Update application (DRAFT only) |
| POST | `/api/v1/loan/{id}/kyc` | Perform KYC verification |
| POST | `/api/v1/loan/{id}/credit-check` | Perform credit bureau check |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/loans` | List all applications |
| GET | `/api/v1/admin/loans?status=ELIGIBLE` | Filter by status |
| GET | `/api/v1/admin/loans/stats` | Get application statistics |
| GET | `/api/v1/admin/loans/{id}/history` | Get full application history |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (OAuth2 form) |
| POST | `/api/v1/auth/token` | Login (JSON body) |
| GET | `/api/v1/auth/me` | Get current user |

## ✅ Business Rules

### Validation Rules
- **PAN Format**: `ABCDE1234F` (5 letters, 4 digits, 1 letter)
- **Minimum Age**: 21 years
- **Maximum Loan**: 20× monthly income

### KYC Rules
- Name match score < 80 → **KYC FAILED**
- Name match score ≥ 80 → **KYC PASSED**

### Credit Bureau Rules
- Credit score < 650 → **REJECTED**
- Active loans > 5 → **REJECTED**

### Eligibility Rules
- **Salaried**: Max EMI = 50% of income
- **Self-employed**: Max EMI = 40% of income
- **Interest Rate**: 12% p.a. (adjusted by credit score)
- **Tenure**: 36 months

## 🧪 Testing the API

### 1. Create a Loan Application

```bash
curl -X POST "http://localhost:8000/api/v1/loan/create" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "mobile": "9876543210",
    "pan": "ABCDE1234F",
    "dob": "1990-01-15",
    "employment_type": "SALARIED",
    "monthly_income": 50000,
    "loan_amount": 500000
  }'
```

### 2. Perform KYC

```bash
curl -X POST "http://localhost:8000/api/v1/loan/1/kyc"
```

### 3. Perform Credit Check

```bash
curl -X POST "http://localhost:8000/api/v1/loan/1/credit-check"
```

### 4. Check Application Status

```bash
curl "http://localhost:8000/api/v1/loan/1"
```

### 5. View All Applications (Admin)

```bash
curl "http://localhost:8000/api/v1/admin/loans"
```

### 6. Filter by Status

```bash
curl "http://localhost:8000/api/v1/admin/loans?status=ELIGIBLE"
curl "http://localhost:8000/api/v1/admin/loans?status=NOT_ELIGIBLE"
```

## 🔧 Configuration

Environment variables can be set in a `.env` file:

```env
DATABASE_URL=sqlite:///./mini_los.db
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

## 📊 Sample Response

### Successful Eligibility

```json
{
  "application_id": 1,
  "credit_score": 720,
  "active_loans": 2,
  "is_approved": true,
  "rejection_reason": null,
  "application_status": "ELIGIBLE",
  "message": "Congratulations! You are eligible for a loan up to ₹1,500,000.00"
}
```

## 📝 License

MIT License
