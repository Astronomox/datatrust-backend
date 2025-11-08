// getToken.js - Get a real Firebase ID token for testing
const admin = require('firebase-admin');
const fetch = require('node-fetch');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

// Your Firebase Web API Key
const FIREBASE_API_KEY = 'AIzaSyAHIFd7giqA0FWTv-nB1ayQq-YBkJgSLsg';

async function getIdToken() {
  try {
    console.log('\n🔐 Getting Firebase ID Token...\n');
    
    // Test user credentials
    const email = 'test@example.com';
    const password = 'Test1234!';
    
    // Step 1: Try to create user (will fail if exists, that's OK)
    try {
      await admin.auth().createUser({
        email: email,
        password: password,
        displayName: 'Test User',
        emailVerified: true
      });
      console.log('✅ Test user created');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('ℹ️  Test user already exists');
      } else {
        throw error;
      }
    }
    
    // Step 2: Sign in with Firebase REST API to get ID token
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }
    
    const idToken = data.idToken;
    
    console.log('✅ ID Token Generated Successfully!\n');
    console.log('📋 Copy this token for Swagger UI:\n');
    console.log('─'.repeat(80));
    console.log(idToken);
    console.log('─'.repeat(80));
    
    console.log('\n🎯 How to use in Swagger UI:');
    console.log('1. Go to http://localhost:5000/api-docs');
    console.log('2. Click the "Authorize" button (🔓 lock icon)');
    console.log('3. Paste the token above (no "Bearer" prefix needed)');
    console.log('4. Click "Authorize" then "Close"');
    console.log('5. Now test any endpoint!\n');
    
    console.log('📝 Test User Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID: ${data.localId}\n`);
    
    console.log('⏰ Token expires in: 1 hour');
    console.log('♻️  Run this script again if token expires\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure your .env file has correct Firebase credentials');
    console.error('2. Check that Firebase Authentication is enabled in Firebase Console');
    console.error('3. Verify the API key is correct\n');
  }
  
  process.exit(0);
}

getIdToken();
