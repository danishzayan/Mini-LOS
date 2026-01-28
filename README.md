# Mini-LOS (Loan Origination System)

## Admin Login Credentials

- **Email:** danishkamal@gmail.com
- **Password:** Danish@123

## Basic Configuration & Installation

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+
- PostgreSQL (or your configured DB)

### 1. Clone the Repository
```
git clone https://github.com/danishzayan/Mini-LOS.git
cd Mini-LOS
```

### 2. Backend Setup (FastAPI)
```
cd server
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
# Configure your DB in .env or app/core/config.py if needed
uvicorn app.main:app --reload
```

### 3. Frontend Setup (Next.js)
```
cd ../client
npm install
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 5. Default Admin Login
Use the credentials above to log in as admin.

---

For more details, see the code comments and configuration files in each folder.
