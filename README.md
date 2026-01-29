# Mini-LOS (Loan Origination System)

## Admin Login Credentials

- **Email:** danishkamal@gmail.com
- **Password:** Danish@123
- **To be admin follow the bullet point `5. Default Admin Login`**

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
venv\Scripts\activate

pip install -r requirements.txt

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
<img width="1337" height="343" alt="image" src="https://github.com/user-attachments/assets/69b2b094-7807-4257-b7d7-f6cef14d93b8" />

Set Admin User (`is_admin = true`)
To enable **admin login**, the `is_admin` field must be set to `true` for the required user in the `users` table.

### SQL Query (PostgreSQL)

```sql
UPDATE users
SET is_admin = true
WHERE email = 'danishkamal@gmail.com';
