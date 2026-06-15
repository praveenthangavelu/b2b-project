const express = require('express');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.userId }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Read notification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Read-all notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
