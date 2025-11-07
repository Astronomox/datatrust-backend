# 🚀 Complete Setup Guide - Data Privacy Backend

## ⏱️ Estimated Time: 15 minutes

---

## STEP 1: Prerequisites Installation

### Install Node.js
1. Download from https://nodejs.org/ (LTS version)
2. Run installer
3. Verify installation:
```cmd
node --version
npm --version
```

### Install PostgreSQL
1. Download from https://www.postgresql.org/download/windows/ or https://get.enterprisedb.com/postgresql/postgresql-18.0-2-windows-x64.exe
2. Run installer
3. **IMPORTANT**: Remember the password you set for the `postgres` user
4. Default port: 5432
5. Verify installation:
```cmd
psql --version
```

---

## STEP 2: Database Setup

### Open PostgreSQL (pgAdmin or Command Line)

**Option A: Using pgAdmin**
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to local server (use password from installation)
3. Right-click "Databases" → Create → Database
4. Name: `data_privacy_db`
5. Click Save

**Option B: Using Command Line**
```cmd
psql -U postgres
```
Enter password, then:
```sql
CREATE DATABASE data_privacy_db;
\q
```

---

## STEP 3: Project Setup

### 1. Navigate to Project Folder
```cmd
cd data-privacy-backend
```

### 2. Install Dependencies
```cmd
npm install
```

This will install all required packages (might take 2-3 minutes)

### 3. Configure Environment

Copy `.env.example` to `.env`:
```cmd
copy .env.example .env
```

Open `.env` in VS Code and update these critical values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=data_privacy_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# JWT Secret (generate a random string)
JWT_SECRET=your_very_secret_key_change_this_to_random_string_123456
```

**Generate a strong JWT_SECRET**: Use any random 32+ character string

---

## STEP 4: Start the Server

### Development Mode (with auto-reload)
```cmd
npm run dev
```

### Production Mode
```cmd
npm start
```

### Expected Output:
```
✅ Database connection established successfully
✅ Database synced
Cron jobs started
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api/v1
```

---

## STEP 5: Seed Sample Data (Optional but Recommended)

Open a **NEW** command prompt window (keep server running), then:

```cmd
cd data-privacy-backend
npm run seed
```

This creates:
- 2 Citizens
- 3 Organizations (Bank, Fintech, Telecom)
- 3 Active Consents
- 5 Compliance Rules
- 1 Admin User

---

## STEP 6: Test the API

### Option A: Using Browser
Visit: http://localhost:5000/api/v1/health

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-05T...",
  "environment": "development"
}
```

### Option B: Using Postman

1. **Install Postman**: https://www.postman.com/downloads/
2. **Test Login Endpoint**:

```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

Body:
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

3. **Copy the token** from response
4. **Use it in subsequent requests**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## STEP 7: Test Key Features

### 1. Register New Citizen
```
POST /api/v1/auth/register
{
  "email": "test@example.com",
  "password": "Test1234",
  "firstName": "Test",
  "lastName": "User",
  "role": "citizen"
}
```

### 2. Register Organization
```
POST /api/v1/auth/register
{
  "email": "testorg@example.com",
  "password": "Test1234",
  "firstName": "Test",
  "lastName": "Org",
  "role": "organization"
}
```

### 3. Create Organization Profile
(Use organization user token)
```
POST /api/v1/organizations
{
  "name": "Test Bank",
  "email": "info@testbank.ng",
  "sector": "banking",
  "size": "medium"
}
```

### 4. Grant Consent
(Use citizen token)
```
POST /api/v1/consent/grant
{
  "organizationId": "COPY_ORG_ID_FROM_STEP_3",
  "dataTypes": ["personal_info", "financial"],
  "purpose": "account_opening",
  "durationDays": 365
}
```

### 5. View Citizen Dashboard
(Use citizen token)
```
GET /api/v1/dashboard/citizen
```

---

## 🐛 Troubleshooting

### Issue: "Error connecting to database"
**Solution:**
- Check PostgreSQL is running
- Verify DB_PASSWORD in .env matches your PostgreSQL password
- Ensure database `data_privacy_db` exists

### Issue: "Port 5000 already in use"
**Solution:**
- Change PORT in .env to 5001 or 3000
- OR kill the process using port 5000

### Issue: "Module not found"
**Solution:**
```cmd
rm -rf node_modules
npm install
```

### Issue: "JWT must be provided"
**Solution:**
- Add Authorization header: `Bearer YOUR_TOKEN`
- Make sure you're logged in and using the token from login response

### Issue: "Validation failed"
**Solution:**
- Check request body matches required format
- Password must be at least 8 characters with uppercase, lowercase, and number

---

## 📝 Test Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Citizen | john.doe@example.com | Password123 |
| Citizen | jane.smith@example.com | Password123 |
| Organization | admin@firstbank.ng | Password123 |
| Organization | admin@flutterwave.ng | Password123 |
| Organization | admin@mtn.ng | Password123 |
| Admin | admin@dataprivacy.ng | Admin123 |

---

## 📊 API Testing Workflow

1. **Login** → Get token
2. **Add token to headers** → `Authorization: Bearer TOKEN`
3. **Test endpoints** → Start with `/api/v1/auth/me`
4. **Create resources** → Organizations, Consents
5. **View dashboards** → Citizen/Organization views
6. **Run compliance scan** → Test automated checks

---

## 🎯 For Hackathon Demo

### Quick Demo Script:

1. **Show Registration**
   - Register citizen
   - Register organization

2. **Show Consent Flow**
   - Organization creates profile
   - Citizen grants consent
   - Show transparency (citizen can see who has access)

3. **Show Compliance**
   - Log a data access
   - Run compliance scan
   - Show violations (if any)

4. **Show Dashboard**
   - Citizen dashboard (their data access history)
   - Organization dashboard (compliance score)

---

## 📚 Full API Documentation

After server starts, test all endpoints:
- Import Postman collection (in docs folder)
- Or use the endpoint list in README.md

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Dependencies installed
- [ ] .env configured correctly
- [ ] Server starts without errors
- [ ] Sample data seeded
- [ ] Health check endpoint working
- [ ] Can login and get token
- [ ] Can create consent
- [ ] Can view dashboard

---

## 🎊 Ready for Hackathon!

Your backend is now fully functional and ready for the demo!

**Next Steps:**
1. Test all endpoints using Postman
2. Prepare demo scenarios
3. Create architecture diagram
4. Write scalability document

---

## 📞 Need Help?

Common commands:
```cmd
# Start server
npm run dev

# Stop server
Ctrl + C

# Check server status
Visit: http://localhost:5000/api/v1/health

# View logs
Check logs/ folder

# Restart fresh
npm run seed (recreates sample data)
```

**Good luck with your hackathon! 🚀**