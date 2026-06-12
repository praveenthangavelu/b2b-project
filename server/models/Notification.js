const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, required: true },
  read:      { type: Boolean, default: false },
  target:    { type: String, default: null }, // page target (e.g. 'validate', 'email', 'phone', 'linkedin')
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
