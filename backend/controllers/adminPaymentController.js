const Payment = require('../models/Payment');
const RefundRequest = require('../models/RefundRequest');
const logger = require('../utils/logger');

/**
 * Get all transactions with filters
 * GET /api/admin/payments
 * Private/Admin
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      currency,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (currency) filter.currency = currency;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Validate and sanitize sortBy to prevent injection
    const allowedSortFields = [
      'createdAt', '-createdAt',
      'completedAt', '-completedAt',
      'amount', '-amount',
      'status', '-status'
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : '-createdAt';

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query
    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort(safeSortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: payments
    });
  } catch (error) {
    logger.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * Get revenue analytics
 * GET /api/admin/payments/analytics/revenue
 * Private/Admin
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Build date filter
    const dateFilter = { status: 'completed' };
    if (startDate || endDate) {
      dateFilter.completedAt = {};
      if (startDate) dateFilter.completedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.completedAt.$lte = new Date(endDate);
    }

    // Total revenue by currency
    const revenueByCurrency = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$currency',
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Revenue over time
    let groupByStage;
    switch (groupBy) {
      case 'day':
        groupByStage = {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' }
        };
        break;
      case 'week':
        groupByStage = {
          year: { $year: '$completedAt' },
          week: { $week: '$completedAt' }
        };
        break;
      case 'month':
      default:
        groupByStage = {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' }
        };
        break;
    }

    const revenueOverTime = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupByStage,
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Top revenue generating courses
    const topCourses = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$course',
          revenue: { $sum: '$amount' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $project: {
          courseId: '$_id',
          title: '$courseInfo.title',
          revenue: 1,
          enrollments: 1
        }
      }
    ]);

    // Refund statistics
    const refundMatch = { status: 'refunded' };
    if (startDate || endDate) {
      // Use refundedAt if available, otherwise fall back to completedAt
      refundMatch.$or = [
        {
          refundedAt: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        },
        {
          refundedAt: { $exists: false },
          completedAt: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        }
      ];
    }
    
    const refundStats = await Payment.aggregate([
      { $match: refundMatch },
      {
        $group: {
          _id: null,
          totalRefunded: { $sum: '$refundedAmount' },
          refundCount: { $sum: 1 }
        }
      }
    ]);

    // Overall statistics
    const overallStats = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
        revenueByCurrency,
        revenueOverTime,
        revenueByMethod,
        topCourses,
        refunds: refundStats[0] || { totalRefunded: 0, refundCount: 0 }
      }
    });
  } catch (error) {
    logger.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

/**
 * Get payment gateway configuration
 * GET /api/admin/payments/gateway-config
 * Private/Admin
 */
exports.getGatewayConfig = async (req, res) => {
  try {
    // Return configuration status (not actual keys for security)
    const config = {
      stripe: {
        enabled: !!process.env.STRIPE_SECRET_KEY,
        configured: !!process.env.STRIPE_SECRET_KEY
      },
      paypal: {
        enabled: !!process.env.PAYPAL_CLIENT_ID,
        configured: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
      },
      fawry: {
        enabled: !!process.env.FAWRY_MERCHANT_CODE,
        configured: !!(process.env.FAWRY_MERCHANT_CODE && process.env.FAWRY_SECRET_KEY)
      },
      paymob: {
        enabled: !!process.env.PAYMOB_API_KEY,
        configured: !!process.env.PAYMOB_API_KEY
      }
    };

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Get gateway config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gateway configuration',
      error: error.message
    });
  }
};

/**
 * Update payment gateway configuration
 * PUT /api/admin/payments/gateway-config
 * Private/Admin
 */
exports.updateGatewayConfig = async (req, res) => {
  try {
    // This is a placeholder - in production, these should be stored in a secure vault
    // or environment variables and require server restart
    res.status(200).json({
      success: true,
      message: 'Gateway configuration updated. Note: Changes to payment gateway credentials require updating environment variables and restarting the server.',
      data: {
        warning: 'Payment gateway credentials should be configured via environment variables for security reasons.'
      }
    });
  } catch (error) {
    logger.error('Update gateway config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gateway configuration',
      error: error.message
    });
  }
};

/**
 * Get payment statistics summary
 * GET /api/admin/payments/stats
 * Private/Admin
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // Get various statistics
    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      todayRevenue,
      monthRevenue,
      lastMonthRevenue,
      pendingRefunds,
      totalRefunds
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.countDocuments({ status: 'refunded' }),
      Payment.aggregate([
        { $match: { status: 'completed', completedAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', completedAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', completedAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RefundRequest.countDocuments({ status: 'pending' }),
      RefundRequest.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          failed: failedPayments,
          refunded: refundedPayments
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          thisMonth: monthRevenue[0]?.total || 0,
          lastMonth: lastMonthRevenue[0]?.total || 0
        },
        refunds: {
          pending: pendingRefunds,
          total: totalRefunds
        }
      }
    });
  } catch (error) {
    logger.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
};

/**
 * Export transactions report
 * GET /api/admin/payments/export
 * Private/Admin
 */
exports.exportTransactions = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const filter = { status: 'completed' };
    if (startDate || endDate) {
      filter.completedAt = {};
      if (startDate) filter.completedAt.$gte = new Date(startDate);
      if (endDate) filter.completedAt.$lte = new Date(endDate);
    }

    const transactions = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-completedAt')
      .lean();

    // Format data for export
    const exportData = transactions.map(t => ({
      transactionId: t.transactionId,
      invoiceNumber: t.invoice?.invoiceNumber,
      date: t.completedAt,
      userName: t.user?.name,
      userEmail: t.user?.email,
      courseTitle: t.course?.title,
      amount: t.amount,
      currency: t.currency,
      paymentMethod: t.paymentMethod,
      status: t.status
    }));

    if (format === 'csv') {
      // Define CSV headers
      const headerFields = [
        'transactionId', 'invoiceNumber', 'date', 'userName', 
        'userEmail', 'courseTitle', 'amount', 'currency', 
        'paymentMethod', 'status'
      ];
      const headers = headerFields.join(',');
      
      // Convert to CSV rows
      const rows = exportData.map(row => 
        headerFields.map(field => {
          const val = row[field] || '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    logger.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions',
      error: error.message
    });
  }
};
