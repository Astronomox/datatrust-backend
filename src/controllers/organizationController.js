const { db } = require('../config/firebase');

class OrganizationController {
  /**
   * Get all organizations
   */
  static async getOrganizations(req, res) {
    try {
      const { sector, size, page = 1, limit = 20 } = req.query;

      let query = db.collection('organizations');

      // Add filters if provided
      if (sector) {
        query = query.where('sector', '==', sector);
      }
      if (size) {
        query = query.where('size', '==', size);
      }

      const snapshot = await query
        .orderBy('name')
        .limit(parseInt(limit))
        .get();

      const organizations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: organizations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: organizations.length
        }
      });
    } catch (error) {
      console.error('Error getting organizations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get organizations'
      });
    }
  }

  /**
   * Get organization by ID
   */
  static async getOrganization(req, res) {
    try {
      const { organizationId } = req.params;

      const doc = await db.collection('organizations').doc(organizationId).get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: doc.id,
          ...doc.data()
        }
      });
    } catch (error) {
      console.error('Error getting organization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get organization'
      });
    }
  }

  /**
   * Create organization (for admin use)
   */
  static async createOrganization(req, res) {
    try {
      const {
        name,
        description,
        sector,
        size,
        contactEmail,
        website,
        complianceScore = 0
      } = req.body;

      const organizationData = {
        name,
        description,
        sector,
        size,
        contactEmail,
        website,
        complianceScore,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orgRef = await db.collection('organizations').add(organizationData);

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: {
          id: orgRef.id,
          ...organizationData
        }
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create organization'
      });
    }
  }

  /**
   * Get organizations by user consents
   */
  static async getUserOrganizations(req, res) {
    try {
      const userId = req.user.uid;

      // Get user's consents
      const consentsSnapshot = await db.collection('consents')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .get();

      const organizationIds = [...new Set(
        consentsSnapshot.docs.map(doc => doc.data().organizationId)
      )];

      // Get organization details
      const organizations = [];
      for (const orgId of organizationIds) {
        const orgDoc = await db.collection('organizations').doc(orgId).get();
        if (orgDoc.exists) {
          organizations.push({
            id: orgDoc.id,
            ...orgDoc.data()
          });
        }
      }

      res.json({
        success: true,
        data: organizations
      });
    } catch (error) {
      console.error('Error getting user organizations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user organizations'
      });
    }
  }
}

module.exports = OrganizationController;