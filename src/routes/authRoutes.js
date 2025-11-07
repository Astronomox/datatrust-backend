const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');

// ✅ REGISTER with Firebase
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: phone
    });

    // Generate custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      data: {
        user: {
          id: userRecord.uid,
          email: userRecord.email,
          firstName,
          lastName
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ LOGIN (Firebase handles this on frontend, but we can verify tokens)
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body; // Frontend sends Firebase ID token

    // Verify token
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);

    res.json({
      success: true,
      data: {
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName
        },
        token: idToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ✅ GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const user = await auth.getUser(decodedToken.uid);

    res.json({
      success: true,
      data: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

module.exports = router;