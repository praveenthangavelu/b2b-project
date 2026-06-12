const mongoose = require('mongoose');

const LookupSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:           { type: String, required: true }, // person | company | decision-maker | validate
  input:          { type: mongoose.Schema.Types.Mixed },   // what was sent to Anymail
  email:          { type: String, default: null },          // resolved email (if any)
  status:         { type: String, default: null },          // valid | risky | not_found | ...
  result:         { type: mongoose.Schema.Types.Mixed },     // raw-ish trimmed result
  creditsCharged: { type: Number, default: 0 },
  createdAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lookup', LookupSchema);
