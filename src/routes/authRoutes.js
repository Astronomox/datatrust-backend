const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Register a new user (Public endpoint - no authentication required)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +2348012345678
 *               role:
 *                 type: string
 *                 enum: [citizen, organization]
 *                 default: citizen
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already registered or invalid data
 *       500:
 *         description: Registration failed
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Login user with email and password (Public endpoint - no authentication required)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile (Protected endpoint)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 */
router.get('/me', authenticate, AuthController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information (Protected endpoint)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               phone:
 *                 type: string
 *                 example: +2348098765432
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.put('/profile', authenticate, AuthController.updateProfile);

module.exports = router;