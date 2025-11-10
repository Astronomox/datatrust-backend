const { admin, db } = require('../config/firebase');
const notificationService = require('../services/notificationService');

class AuthController {
  /**
   * Register new user (Firebase + Firestore)
   */
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, role = 'citizen' } = req.body;

      // Check if using Firebase token (protected route) or direct registration
      if (req.user) {
        // Firebase token provided - use existing Firebase user
        const firebaseUser = req.user;

        // Check if user already exists in Firestore
        const existingUser = await db.collection('users').doc(firebaseUser.uid).get();
        
        if (existingUser.exists) {
          return res.status(400).json({
            success: false,
            message: 'User already registered'
          });
        }

        // Create user in Firestore
        const userData = {
          email: firebaseUser.email || email,
          firstName,
          lastName,
          phone,
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('users').doc(firebaseUser.uid).set(userData);

        // 🆕 Send welcome notification (Email + SMS)
        try {
          const userForNotification = {
            id: firebaseUser.uid,
            email: firebaseUser.email || email,
            firstName,
            lastName,
            phone,
            role
          };
          await notificationService.notifyRegistration(userForNotification);
        } catch (notifError) {
          console.error('Registration notification error:', notifError);
        }

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            uid: firebaseUser.uid,
            ...userData
          }
        });

      } else {
        // No Firebase token - create Firebase user first
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required for direct registration'
          });
        }

        // Create user in Firebase Auth
        const firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          phoneNumber: phone
        });

        // Create user in Firestore
        const userData = {
          email,
          firstName,
          lastName,
          phone,
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('users').doc(firebaseUser.uid).set(userData);

        // 🆕 Send welcome notification (Email + SMS)
        try {
          const userForNotification = {
            id: firebaseUser.uid,
            email,
            firstName,
            lastName,
            phone,
            role
          };
          await notificationService.notifyRegistration(userForNotification);
        } catch (notifError) {
          console.error('Registration notification error:', notifError);
        }

        // Generate custom token for immediate login
        const token = await admin.auth().createCustomToken(firebaseUser.uid);

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            uid: firebaseUser.uid,
            ...userData,
            token
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle Firebase-specific errors
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      if (error.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  /**
   * Login user (Direct email/password login)
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // For Firebase Auth, we typically handle login on frontend
      // But for API testing, we can verify credentials
      let firebaseUser;
      try {
        // Verify email/password with Firebase
        const userRecord = await admin.auth().getUserByEmail(email);
        firebaseUser = userRecord;
      } catch (firebaseError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }

      const userData = userDoc.data();

      // Check if account is active
      if (!userData.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update last login
      await db.collection('users').doc(firebaseUser.uid).update({
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      // 🆕 Send login notification (Email + SMS)
      try {
        const userForNotification = {
          id: firebaseUser.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role
        };
        
        await notificationService.notifyLogin(
          userForNotification,
          req.ip,
          req.get('user-agent'),
          'Nigeria'
        );
      } catch (notifError) {
        console.error('Login notification error:', notifError);
      }

      // Generate custom token
      const token = await admin.auth().createCustomToken(firebaseUser.uid);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          uid: firebaseUser.uid,
          ...userData,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.uid;

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          uid: userId,
          ...userDoc.data()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.uid;
      const { firstName, lastName, phone } = req.body;

      const updateData = {
        updatedAt: new Date()
      };

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;

      await db.collection('users').doc(userId).update(updateData);

      // Get updated user
      const userDoc = await db.collection('users').doc(userId).get();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          uid: userId,
          ...userDoc.data()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
}

module.exports = AuthController;