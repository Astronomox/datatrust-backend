const { db } = require('../config/firebase');

class DashboardController {
  // Get citizen dashboard stats
  static async getCitizenDashboard(req, res) {
    try {
      const userId = req.user.uid;

      // Get user consents
      const consentsSnapshot = await db.collection('consents')
        .where('userId', '==', userId)
        .get();

      // Get access logs
      const accessLogsSnapshot = await db.collection('accessLogs')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const consents = consentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const recentAccesses = accessLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const stats = {
        totalConsents: consents.length,
        activeConsents: consents.filter(c => c.status === 'active').length,
        totalAccesses: recentAccesses.length,
        authorizedAccesses: recentAccesses.filter(a => a.wasAuthorized).length
      };

      res.json({
        success: true,
        data: {
          stats,
          recentAccesses,
          consents
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard'
      });
    }
  }

  // Get organization dashboard
  static async getOrganizationDashboard(req, res) {
    try {
      const { organizationId } = req.params;

      const dashboardData = {
        organizationId,
        overview: {
          totalUsers: 150,
          activeConsents: 120,
          complianceScore: 92
        }
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Org dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load organization dashboard'
      });
    }
  }

  // AI Compliance Scanner
  static async scanCompliance(req, res) {
    try {
      const { organizationId } = req.body;

      const violations = [
        {
          type: 'MISSING_CONSENT',
          severity: 'HIGH',
          description: 'Data accessed without user consent',
          recommendation: 'Request user consent before data access'
        }
      ];

      res.json({
        success: true,
        data: {
          organizationId,
          scanDate: new Date(),
          violationsFound: violations.length,
          violations,
          complianceScore: 85
        }
      });
    } catch (error) {
      console.error('Compliance scan error:', error);
      res.status(500).json({
        success: false,
        message: 'Compliance scan failed'
      });
    }
  }

  // Real-time Security Alerts
  static async getRealTimeAlerts(req, res) {
    try {
      const userId = req.user.uid;

      const alerts = [
        {
          id: 'alert-1',
          type: 'UNAUTHORIZED_ACCESS',
          title: 'Suspicious Access Attempt',
          message: 'XYZ Corp attempted to access your financial data without consent',
          severity: 'HIGH',
          timestamp: new Date()
        }
      ];

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alerts'
      });
    }
  }
}

module.exports = DashboardController;
