const express = require('express');
const router = express.Router();
const multer = require('multer');
const TicketAttachment = require('../models/TicketAttachment');
const { auth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

router.use(auth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload attachment
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { ticket } = req.body;

    const attachment = new TicketAttachment({
      ticket,
      filename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    await attachment.save();

    // Emit socket event
    req.app.get('io').emit('attachment:added', { ticket, attachment });

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get attachments for a ticket
router.get('/ticket/:ticketId', async (req, res) => {
  try {
    const attachments = await TicketAttachment.find({ ticket: req.params.ticketId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachments', error: error.message });
  }
});

// Download attachment
router.get('/:id/download', async (req, res) => {
  try {
    const attachment = await TicketAttachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(attachment.filePath, attachment.filename);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

// Delete attachment
router.delete('/:id', async (req, res) => {
  try {
    const attachment = await TicketAttachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await attachment.deleteOne();

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
});

module.exports = router;

