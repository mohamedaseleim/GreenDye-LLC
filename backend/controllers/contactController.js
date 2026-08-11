const ContactMessage = require('../models/ContactMessage');

const clean = (value) => String(value || '').replace(/[<>]/g, '').trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.createContactMessage = async (req, res, next) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const subject = clean(req.body.subject);
    const message = clean(req.body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject and message are required' });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (name.length > 120 || email.length > 254 || subject.length > 200 || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'One or more fields exceed the allowed length' });
    }

    const data = await ContactMessage.create({
      name, email, subject, message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || ''
    });

    return res.status(201).json({ success: true, message: 'Message received successfully', data: { id: data._id } });
  } catch (error) { next(error); }
};

exports.getContactMessages = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const [data, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ContactMessage.countDocuments(query)
    ]);
    res.json({ success: true, data, count: data.length, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.updateContactMessage = async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.status) allowed.status = req.body.status;
    if (req.body.adminNotes !== undefined) allowed.adminNotes = clean(req.body.adminNotes);
    if (allowed.status === 'resolved') allowed.resolvedAt = new Date();
    allowed.assignedTo = req.user._id;
    const data = await ContactMessage.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Contact message not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
