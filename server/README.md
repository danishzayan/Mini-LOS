# Mini-LOS (Mini Loan Origination System)

A FastAPI-based backend for a simplified Loan Origination System with workflow management, KYC verification, credit bureau checks, and eligibility calculation.


### 1. Create Virtual Environment

```bash
cd server
python -m venv venv
venv\Scripts\activate

```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
uvicorn app.main:app --reload
 python -m uvicorn app.main:app --reload --port 8000
```
