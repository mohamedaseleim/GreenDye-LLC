const ConsultingPayment = require('../models/ConsultingPayment');
const ConsultingInvoice = require('../models/ConsultingInvoice');

const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return undefined;
  const value = {};
  if (startDate) value.$gte = new Date(startDate);
  if (endDate) value.$lte = new Date(endDate);
  return value;
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.gateway || req.query.paymentMethod) filter.gateway = req.query.gateway || req.query.paymentMethod;
    if (req.query.currency) filter.currency = req.query.currency;
    const createdAt = buildDateFilter(req.query.startDate, req.query.endDate);
    if (createdAt) filter.createdAt = createdAt;
    const [data, total] = await Promise.all([
      ConsultingPayment.find(filter)
        .populate('client', 'name email')
        .populate('project', 'projectNumber title')
        .populate('invoice', 'invoiceNumber total paidAmount status')
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ConsultingPayment.countDocuments(filter)
    ]);
    res.json({ success: true, data, count: data.length, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getPaymentStats = async (req, res, next) => {
  try {
    const [payments, invoices] = await Promise.all([
      ConsultingPayment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$currency', gross: { $sum: '$amount' }, fees: { $sum: '$fees' }, net: { $sum: '$netAmount' }, count: { $sum: 1 } } }
      ]),
      ConsultingInvoice.aggregate([
        { $group: { _id: '$currency', invoiced: { $sum: '$total' }, paid: { $sum: '$paidAmount' }, count: { $sum: 1 }, overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } } } }
      ])
    ]);
    res.json({ success: true, data: { payments, invoices } });
  } catch (error) { next(error); }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const match = { status: 'completed' };
    const paidAt = buildDateFilter(req.query.startDate, req.query.endDate);
    if (paidAt) match.paidAt = paidAt;
    const data = await ConsultingPayment.aggregate([
      { $match: match },
      { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' }, currency: '$currency' }, revenue: { $sum: '$amount' }, net: { $sum: '$netAmount' }, transactions: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.exportTransactions = async (req, res, next) => {
  try {
    const data = await ConsultingPayment.find().populate('client', 'name email').populate('project', 'projectNumber title').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

exports.getGatewayConfig = async (req, res) => res.json({ success: true, data: { manual: true, stripe: Boolean(process.env.STRIPE_SECRET_KEY), paypal: Boolean(process.env.PAYPAL_CLIENT_ID), fawry: Boolean(process.env.FAWRY_MERCHANT_CODE), paymob: Boolean(process.env.PAYMOB_API_KEY) } });
exports.updateGatewayConfig = async (req, res) => res.status(400).json({ success: false, message: 'Gateway secrets must be managed through protected server environment variables, not the browser' });
