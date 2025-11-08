const ComplianceService = require('../services/complianceService');

class ComplianceController {
  /**
   * Check compliance for data access
   */
  static async checkCompliance(req, res) {
    try {
      const { organizationId, dataType, purpose } = req.body;
      const userId = req.user.uid;

      const compliance = await ComplianceService.checkCompliance(
        userId,
        organizationId,
        dataType,
        purpose
      );

      res.json({
        success: true,
        data: compliance
      });
    } catch (error) {
      console.error('Compliance check error:', error);
      res.status(500).json({
        success: false,
        message: 'Compliance check failed'
      });
    }
  }

  /**
   * Get user compliance score
   */
  static async getUserComplianceScore(req, res) {
    try {
      const userId = req.user.uid;

      const complianceScore = await ComplianceService.getUserComplianceScore(userId);

      res.json({
        success: true,
        data: complianceScore
      });
    } catch (error) {
      console.error('Error getting compliance score:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get compliance score'
      });
    }
  }

  /**
   * Get organization compliance
   */
  static async getOrganizationCompliance(req, res) {
    try {
      const { organizationId } = req.params;

      const compliance = await ComplianceService.getOrganizationCompliance(organizationId);

      res.json({
        success: true,
        data: compliance
      });
    } catch (error) {
      console.error('Error getting organization compliance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get organization compliance'
      });
    }
  }

  /**
   * Report compliance violation
   */
  static async reportViolation(req, res) {
    try {
      const { organizationId, violationType, description, evidence } = req.body;
      const userId = req.user.uid;

      const violationData = {
        userId,
        organizationId,
        violationType,
        description,
        evidence,
        status: 'REPORTED',
        severity: 'HIGH',
        reportedAt: new Date()
      };

      const violationId = await ComplianceService.logViolation(violationData);

      res.status(201).json({
        success: true,
        message: 'Violation reported successfully',
        data: { violationId }
      });
    } catch (error) {
      console.error('Error reporting violation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report violation'
      });
    }
  }
}

module.exports = ComplianceController;