const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard and analytics endpoints for citizens and organizations
 */

/**
 * @swagger
 * /dashboard/citizen:
 *   get:
 *     summary: Get citizen dashboard data
 *     description: Retrieve personalized dashboard data including consents, access logs, and statistics for the authenticated citizen user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalConsents:
 *                           type: number
 *                           example: 5
 *                           description: Total number of consents granted by user
 *                         activeConsents:
 *                           type: number
 *                           example: 3
 *                           description: Number of currently active consents
 *                         totalAccesses:
 *                           type: number
 *                           example: 10
 *                           description: Total data access attempts
 *                         authorizedAccesses:
 *                           type: number
 *                           example: 8
 *                           description: Number of authorized data accesses
 *                     recentAccesses:
 *                       type: array
 *                       description: Recent data access logs
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           organizationId:
 *                             type: string
 *                           dataType:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           wasAuthorized:
 *                             type: boolean
 *                     consents:
 *                       type: array
 *                       description: User's consents
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           organizationId:
 *                             type: string
 *                           purpose:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [active, revoked, expired]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/citizen', authenticate, DashboardController.getCitizenDashboard);

/**
 * @swagger
 * /dashboard/organization/{organizationId}:
 *   get:
 *     summary: Get organization dashboard
 *     description: Retrieve dashboard data and analytics for a specific organization
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The organization ID
 *         example: org_123abc
 *     responses:
 *       200:
 *         description: Organization dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizationId:
 *                       type: string
 *                       example: org_123abc
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 150
 *                         activeConsents:
 *                           type: number
 *                           example: 120
 *                         complianceScore:
 *                           type: number
 *                           example: 92
 *                           description: Compliance score out of 100
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.get('/organization/:organizationId', authenticate, DashboardController.getOrganizationDashboard);

/**
 * @swagger
 * /dashboard/compliance-scan:
 *   post:
 *     summary: Run AI-powered compliance scan
 *     description: Execute an automated NDPR compliance scan for an organization using AI analysis
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *             properties:
 *               organizationId:
 *                 type: string
 *                 description: Organization ID to scan
 *                 example: org_123abc
 *     responses:
 *       200:
 *         description: Compliance scan completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizationId:
 *                       type: string
 *                     scanDate:
 *                       type: string
 *                       format: date-time
 *                     violationsFound:
 *                       type: number
 *                       example: 3
 *                     violations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: MISSING_CONSENT
 *                           severity:
 *                             type: string
 *                             enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                             example: HIGH
 *                           description:
 *                             type: string
 *                             example: Data accessed without user consent
 *                           recommendation:
 *                             type: string
 *                             example: Request user consent before data access
 *                     complianceScore:
 *                       type: number
 *                       example: 85
 *                       description: Overall compliance score (0-100)
 *       400:
 *         description: Bad request - Missing organizationId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Scan failed
 */
router.post('/compliance-scan', authenticate, DashboardController.scanCompliance);

/**
 * @swagger
 * /dashboard/real-time-alerts:
 *   get:
 *     summary: Get real-time security alerts
 *     description: Retrieve real-time security alerts and notifications for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: alert-1
 *                       type:
 *                         type: string
 *                         enum: [UNAUTHORIZED_ACCESS, CONSENT_EXPIRED, DATA_BREACH, SUSPICIOUS_ACTIVITY]
 *                         example: UNAUTHORIZED_ACCESS
 *                       title:
 *                         type: string
 *                         example: Suspicious Access Attempt
 *                       message:
 *                         type: string
 *                         example: XYZ Corp attempted to access your financial data without consent
 *                       severity:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                         example: HIGH
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-11-07T22:00:00.000Z
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Failed to retrieve alerts
 */
router.get('/real-time-alerts', authenticate, DashboardController.getRealTimeAlerts);

module.exports = router;
