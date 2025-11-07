# Data Privacy Backend - NDPR Compliance System

A comprehensive backend system for managing data privacy, consent, and NDPR compliance in Nigeria's digital economy.

## 🎯 Features

- **Consent Management**: Grant, revoke, and track data processing consents
- **Transparency Dashboard**: Complete audit trail of data access
- **Automated Compliance**: AI-driven NDPR compliance checking
- **Access Logging**: Immutable logs of all data access events
- **Violation Detection**: Automatic detection of non-compliant practices
- **Organization Management**: Multi-organization support with API keys
- **Role-Based Access**: Citizen, Organization, and Admin roles

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone & Navigate
```bash
cd data-privacy-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
copy .env.example .env
```

### 4. Configure Database
Make sure PostgreSQL is running, then create a database:
```sql
CREATE DATABASE data_privacy_db;
```

### 5. Update .env with your database credentials
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=data_privacy_db
DB_USER=your_username
DB_PASSWORD=your_password
```

### 6. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📊 Database Setup

The database tables will be automatically created when you start the server for the first time.

### Manual Migration (if needed)
```bash
npm run migrate
```

### Seed Sample Data
```bash
npm run seed
```

## 📁 Project Structure

```
data-privacy-backend/
├── src/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── validators/      # Input validation
├── logs/                # Application logs
├── .env                 # Environment variables
├── server.js            # Main entry point
└── package.json         # Dependencies

```

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Consent Management
- `POST /api/v1/consent/grant` - Grant consent
- `PUT /api/v1/consent/:id/revoke` - Revoke consent
- `GET /api/v1/consent/my-consents` - Get user's consents
- `GET /api/v1/consent/:id` - Get consent by ID
- `POST /api/v1/consent/check` - Check consent validity
- `GET /api/v1/consent/organization/:orgId` - Get org consents

### Access Logs
- `POST /api/v1/access-logs` - Log data access
- `GET /api/v1/access-logs/my-data` - Get user's access logs
- `GET /api/v1/access-logs/organization/:orgId` - Get org logs
- `GET /api/v1/access-logs/unauthorized` - Get unauthorized access

### Compliance
- `POST /api/v1/compliance/scan/:orgId` - Run compliance scan
- `GET /api/v1/compliance/summary/:orgId` - Get compliance summary
- `GET /api/v1/compliance/violations/:orgId` - Get violations
- `PUT /api/v1/compliance/violations/:id/resolve` - Resolve violation
- `GET /api/v1/compliance/rules` - Get compliance rules

### Organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations` - Get all organizations
- `GET /api/v1/organizations/:id` - Get organization by ID
- `GET /api/v1/organizations/my/organization` - Get my organization
- `PUT /api/v1/organizations/:id` - Update organization
- `POST /api/v1/organizations/:id/regenerate-key` - Regenerate API key

### Dashboard
- `GET /api/v1/dashboard/citizen` - Citizen dashboard
- `GET /api/v1/dashboard/organization/:orgId` - Organization dashboard

## 🧪 Testing with Postman

Import the Postman collection (see docs folder) for ready-to-use API requests.

### Quick Test Flow:

1. **Register a citizen**
   ```json
   POST /api/v1/auth/register
   {
     "email": "citizen@example.com",
     "password": "Test1234",
     "firstName": "John",
     "lastName": "Doe",
     "role": "citizen"
   }
   ```

2. **Register an organization**
   ```json
   POST /api/v1/auth/register
   {
     "email": "org@example.com",
     "password": "Test1234",
     "firstName": "Jane",
     "lastName": "Smith",
     "role": "organization"
   }
   ```

3. **Create organization profile**
   ```json
   POST /api/v1/organizations
   {
     "name": "First Bank Nigeria",
     "email": "contact@firstbank.ng",
     "sector": "banking",
     "size": "large"
   }
   ```

4. **Grant consent (as citizen)**
   ```json
   POST /api/v1/consent/grant
   {
     "organizationId": "org-uuid-here",
     "dataTypes": ["personal_info", "financial"],
     "purpose": "account_opening",
     "durationDays": 365
   }
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | data_privacy_db |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | Token expiration | 7d |

## 🏗️ Architecture

### System Design

```
┌─────────────┐
│   Clients   │ (Web/Mobile Apps)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   API Gateway       │ (Express + Middleware)
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌─────────┐ ┌──────────────┐
│ Auth    │ │  Services    │
│ Layer   │ │ - Consent    │
└─────────┘ │ - Audit      │
            │ - Compliance │
            └──────┬───────┘
                   │
                   ▼
         ┌──────────────────┐
         │   PostgreSQL DB  │
         └──────────────────┘
```

### Data Flow

1. **Consent Grant Flow**
   - Citizen requests consent grant
   - System validates organization exists
   - Consent record created with expiry
   - Organization notified via email
   - Audit log created

2. **Data Access Flow**
   - Organization requests data access
   - System checks for valid consent
   - Access logged (authorized/unauthorized)
   - User notified if configured
   - Compliance rules evaluated

3. **Compliance Check Flow**
   - Daily/on-demand scan triggered
   - All access logs reviewed
   - Rules applied to detect violations
   - Violations logged and scored
   - Compliance score updated

## 🎓 NDPR Compliance Features

### Implemented NDPR Principles

1. **Lawfulness & Consent** - Explicit consent management
2. **Purpose Limitation** - Purpose tracking for all data access
3. **Data Minimization** - Granular data type permissions
4. **Accuracy** - Version control on consents
5. **Storage Limitation** - Expiry dates on consents
6. **Integrity & Confidentiality** - Audit logging
7. **Accountability** - Compliance scoring and reporting

## 📈 Scalability

### For Small Businesses (SME)
- Free tier with basic consent management
- Up to 1000 users
- Email notifications
- Basic compliance dashboard

### For Large Enterprises
- Custom compliance rules
- Unlimited users
- Advanced analytics
- On-premise deployment option
- Dedicated support

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-XX

# Verify credentials in .env match your PostgreSQL setup
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Your Name - Backend Developer

## 📞 Support

For hackathon support, contact: [abdullahioriola02@gmail.com]

---

**Built for the Data Privacy Hackathon 2025** 🚀
**Theme: Building Trust in Nigeria's Digital Economy**