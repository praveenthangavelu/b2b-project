const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  plan:         { type: String, default: 'Pro' },
  credits:      { type: Number, default: 6300 },
  creditsUsed:  { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
