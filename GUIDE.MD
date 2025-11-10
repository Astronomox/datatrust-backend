## Quick Steps to Update Your GitHub Repository

Since you've already pushed before, here's the simple workflow to update:[1][2]

```bash
# Check what files changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Update: Add testing documentation and deployment guide"

# Push to GitHub
git push origin main
```

That's it! Your changes will be updated on GitHub automatically.[1]

***

## Testing Guide

```markdown
# 🧪 Testing Guidelines - DataTrust Nigeria Platform

## 📋 Setup Before Testing

### Prerequisites
- Postman installed (or any API client)
- Server running on `http://localhost:5000`
- Firebase project configured
- Email and SMS credentials set in `.env`

### Start the Server
```
npm run dev
```

Server should start on port 5000. Verify with:
```
GET http://localhost:5000/health
```

---

## 🔐 Authentication Testing

### Test 1: User Registration
**Endpoint:** `POST http://localhost:5000/api/v1/auth/register`

**Request Body:**
```
{
  "email": "testuser@example.com",
  "password": "SecurePass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+2348012345678",
  "role": "citizen"
}
```

**Expected Response (201 Created):**
```
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase-uid-here",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "token": "jwt-token-here"
  }
}
```

**What to Check:**
- ✅ Email received with welcome message
- ✅ SMS received with welcome text
- ✅ User created in Firebase Auth
- ✅ User document created in Firestore

---

### Test 2: User Login
**Endpoint:** `POST http://localhost:5000/api/v1/auth/login`

**Request Body:**
```
{
  "email": "testuser@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (200 OK):**
```
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uid": "firebase-uid",
      "email": "testuser@example.com",
      "firstName": "Test",
      "lastName": "User"
    },
    "token": "jwt-token-here"
  }
}
```

**What to Check:**
- ✅ Security alert email received
- ✅ Security alert SMS received
- ✅ Token returned for authentication
- ✅ Console shows notification logs

---

## 🎯 Test Scenarios

### Scenario 1: Successful Registration Flow
1. Use new email address (not previously registered)
2. Send POST request to `/auth/register`
3. Verify HTTP 201 response
4. Check email inbox for welcome message
5. Check phone for welcome SMS
6. Verify user in Firebase Console

### Scenario 2: Duplicate Registration
1. Register with email: `test@example.com`
2. Try registering again with same email
3. **Expected:** HTTP 400 error
4. **Message:** "Email already registered"

### Scenario 3: Invalid Login
1. Send POST to `/auth/login` with wrong password
2. **Expected:** HTTP 401 error
3. **Message:** "Invalid credentials"

### Scenario 4: Login Notifications
1. Login with valid credentials
2. Check email for security alert
3. **Should contain:** IP address, device info, timestamp
4. Check phone for SMS alert

---

## 📧 Notification Verification

### Email Notifications
**Check For:**
- Beautiful HTML template
- Correct recipient email
- Subject line appropriate for action
- No spam folder delivery
- Branding and styling

**Registration Email Should Contain:**
- Welcome message
- User's first name
- Getting started instructions
- Company branding

**Login Email Should Contain:**
- Security alert message
- Login timestamp
- Device/browser information
- IP address (if available)
- "Not you?" warning

### SMS Notifications
**Check For:**
- Delivery within 30 seconds
- Correct phone number format
- Clear, concise message
- Sender ID: "DataTrust"

**Registration SMS Format:**
```
Welcome to DataTrust Nigeria, [Name]! Your account has been created successfully. We protect your data privacy rights.
```

**Login SMS Format:**
```
Security Alert: New login to your DataTrust account on [Date]. If this wasn't you, contact support immediately.
```

---

## 🔍 Debugging & Monitoring

### Console Logs to Watch
```
📧 Email sent to: testuser@example.com
📱 SMS sent to: +2348012345678
🔔 Login notifications sent successfully
✅ User created: firebase-uid-123
```

### Common Issues & Solutions

#### Emails Not Sending
**Problem:** No email received
**Solutions:**
1. Check Gmail app password in `.env`
2. Verify `EMAIL_USER` and `EMAIL_PASSWORD`
3. Check console for SMTP errors
4. Look in spam/junk folder

#### SMS Not Sending
**Problem:** No SMS received
**Solutions:**
1. Verify Termii API key is correct
2. Check phone number format: `+234XXXXXXXXXX`
3. Ensure Termii account has credit balance
4. Check console for Termii API errors

#### Registration Fails
**Problem:** 400 or 500 error on registration
**Solutions:**
1. Email may already exist in Firebase
2. Check password is at least 6 characters
3. Verify all required fields provided
4. Check Firebase configuration

#### Token Issues
**Problem:** Authentication token not working
**Solutions:**
1. Verify token format (should be JWT)
2. Check token expiration
3. Ensure token included in Authorization header
4. Format: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## 🚀 Quick Test Data

### Test User 1 (Citizen)
```
{
  "email": "citizen@test.com",
  "password": "Test1234!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "role": "citizen"
}
```

### Test User 2 (Organization)
```
{
  "email": "org@test.com",
  "password": "Test1234!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+2348098765432",
  "role": "organization"
}
```

### Test User 3 (DPA)
```
{
  "email": "dpa@test.com",
  "password": "Test1234!",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+2348087654321",
  "role": "dpa"
}
```

---

## ✅ Success Indicators

### Registration Success Checklist
- [ ] HTTP 201 Created status
- [ ] User data returned with Firebase UID
- [ ] Authentication token generated
- [ ] Welcome email received
- [ ] Welcome SMS received
- [ ] User appears in Firebase Console
- [ ] Console logs show successful operations

### Login Success Checklist
- [ ] HTTP 200 OK status
- [ ] User profile data returned
- [ ] Fresh authentication token
- [ ] Security alert email received
- [ ] Security alert SMS received
- [ ] Console logs show notifications sent

---

## 🛠️ Postman Collection Setup

### Headers for All Requests
```
Content-Type: application/json
```

### Headers for Authenticated Requests
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Environment Variables (Optional)
Create Postman environment with:
```
BASE_URL: http://localhost:5000
API_VERSION: /api/v1
AUTH_TOKEN: (set after login)
```

---

## 📱 Testing with cURL

### Register User
```
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+2348012345678",
    "role": "citizen"
  }'
```

### Login User
```
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

---

## 📊 Expected Response Times
- Registration: < 3 seconds
- Login: < 2 seconds
- Email delivery: < 5 seconds
- SMS delivery: < 30 seconds

## 🎯 Testing Priority Order
1. Health check endpoint
2. User registration
3. Email notification verification
4. SMS notification verification
5. User login
6. Login notifications
7. Error handling (duplicates, invalid data)
8. Token authentication

---

**Note:** Replace test emails and phone numbers with actual values you can access to verify notifications work correctly.
```

***

## Deployment Guide (Copy & Paste)

```markdown
# 🚀 Deployment Guide - DataTrust Nigeria Platform

## 🎯 Deployment Options

### Option 1: Render (Recommended for Node.js + Firebase)

#### Prerequisites
- GitHub repository pushed
- Render account (free tier available)
- Environment variables ready

#### Steps

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `data-privacy-platform` repository

3. **Configure Build Settings**
   ```
   Name: datatrust-nigeria
   Environment: Node
   Region: Frankfurt (closest to Nigeria)
   Branch: main
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   Add all variables from your `.env` file:
   ```
   NODE_ENV=production
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   TERMII_API_KEY=your-termii-key
   TERMII_SENDER_ID=DataTrust
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at `https://datatrust-nigeria.onrender.com`

#### Update Deployment
```
# Make changes locally
git add .
git commit -m "Update: Your changes"
git push origin main
```
Render auto-deploys on push! [web:32]

---

### Option 2: Vercel (For Node.js API)

#### Prerequisites
- GitHub repository
- Vercel account

#### Create `vercel.json` in Project Root
```
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

#### Deploy Steps
1. Install Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy:
   ```
   vercel
   ```

4. Add environment variables in Vercel dashboard:
   - Go to project settings
   - Add all `.env` variables

#### Update Deployment
```
git push origin main
```
Vercel auto-deploys from GitHub! [web:34]

---

### Option 3: Railway

#### Steps
1. Visit [railway.app](https://railway.app)
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

---

## 🔧 Pre-Deployment Checklist

### Code Preparation
- [ ] All environment variables documented
- [ ] `.env` file NOT pushed to GitHub
- [ ] `.gitignore` includes `node_modules/` and `.env`
- [ ] `package.json` has `start` script
- [ ] Firebase credentials configured
- [ ] Email/SMS services tested locally

### package.json Scripts
```
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build needed'"
  }
}
```

### Firebase Security
- [ ] Firebase rules configured for production
- [ ] Service account key secured
- [ ] API keys restricted to production domains

### Email/SMS Configuration
- [ ] Gmail app password generated
- [ ] Termii API key verified
- [ ] Test notifications before deployment

---

## 🌐 Post-Deployment Testing

### Test Production Endpoints
Replace `localhost:5000` with your deployment URL:

```
# Health check
curl https://your-app.onrender.com/health

# Test registration
curl -X POST https://your-app.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "production@test.com",
    "password": "Test1234!",
    "firstName": "Prod",
    "lastName": "Test",
    "phone": "+2348012345678",
    "role": "citizen"
  }'
```

### Verify
- [ ] API responds correctly
- [ ] Emails sending in production
- [ ] SMS sending in production
- [ ] Firebase authentication working
- [ ] No CORS errors
- [ ] SSL certificate active (HTTPS)

---

## 🔐 Security for Production

### Environment Variables
**NEVER commit:**
- Firebase private keys
- Email passwords
- API keys
- Any `.env` files

### Secure Practices
1. Use app passwords for Gmail
2. Restrict Firebase API keys to production domains
3. Enable Firebase security rules
4. Use HTTPS only
5. Implement rate limiting

---

## 📊 Monitoring

### Render Monitoring
- View logs in Render dashboard
- Set up alerts for downtime
- Monitor resource usage

### Log Analysis
Check production logs for:
```
✅ Server started successfully
📧 Email notifications sent
📱 SMS notifications sent
❌ Any error messages
```

---

## 🚀 Continuous Deployment

Both Render and Vercel support auto-deployment:

```
# Make changes
git add .
git commit -m "feat: Add new feature"
git push origin main
```

Your app automatically redeploys! [web:5]

---

## 🐛 Common Deployment Issues

### Issue: Environment Variables Not Working
**Solution:** Verify all variables set in hosting platform dashboard

### Issue: Firebase Connection Fails
**Solution:** Check Firebase private key format (must be string with `\n`)

### Issue: Emails Not Sending
**Solution:** Verify Gmail app password and sender email

### Issue: Port Errors
**Solution:** Use `process.env.PORT || 5000` in server setup

### Issue: Build Fails
**Solution:** Check `package.json` has all dependencies listed

---

## 📱 Share Your Project

### For Hackathon Judges
Provide:
- Live URL: `https://datatrust-nigeria.onrender.com`
- API Documentation: `https://datatrust-nigeria.onrender.com/api-docs`
- GitHub Repository: `https://github.com/YOUR_USERNAME/data-privacy-platform`
- Test credentials (if needed)

### README Badge
Add to your GitHub README:
```
[![Live Demo](https://img.shields.io/badge/Live-Demo-successhttps://img.shields.yment Success Indicators

- [ ] App accessible via HTTPS URL
- [ ] API endpoints responding correctly
- [ ] Swagger documentation accessible
- [ ] Test registration works in production
- [ ] Emails delivered in production
- [ ] SMS delivered in production
- [ ] No console errors
- [ ] Logs show successful operations
- [ ] Firebase integration working
- [ ] Authentication functioning properly

