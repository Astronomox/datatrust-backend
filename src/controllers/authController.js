const { admin, db } = require('../config/firebase');

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const { email, firstName, lastName, phone, role = 'citizen' } = req.body;

      // Get user from Firebase Auth (already created by frontend)
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

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          uid: firebaseUser.uid,
          ...userData
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const firebaseUser = req.user;

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }

      // Update last login
      await db.collection('users').doc(firebaseUser.uid).update({
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          uid: firebaseUser.uid,
          ...userDoc.data()
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
