import Contact from '../models/Contact.js';
import { asyncHandler } from '../middleware/error.js';

// @desc    Submit a contact message from the website
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    subject: subject || 'General enquiry',
    message: message.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! Our team will get back to you shortly.',
    contact,
  });
});

// @desc    List all contact messages (admin)
// @route   GET /api/contacts
// @access  Admin
export const getContacts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
  const contacts = await Contact.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, contacts, count: contacts.length });
});

// @desc    Get one contact message
// @route   GET /api/contacts/:id
// @access  Admin
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
  if (contact.status === 'New') {
    contact.status = 'Read';
    await contact.save();
  }
  res.json({ success: true, contact });
});

// @desc    Mark a contact message as read / replied / closed and optionally send a reply note
// @route   PUT /api/contacts/:id
// @access  Admin
export const updateContact = asyncHandler(async (req, res) => {
  const { status, reply } = req.body;
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

  if (status) contact.status = status;
  if (reply !== undefined) {
    contact.reply = reply;
    if (reply.trim() && contact.status !== 'Closed') contact.status = 'Replied';
    contact.repliedAt = new Date();
  }
  await contact.save();
  res.json({ success: true, message: 'Message updated', contact });
});

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Admin
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, message: 'Message deleted' });
});
