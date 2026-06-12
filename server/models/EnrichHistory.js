const mongoose = require('mongoose');

const EnrichHistorySchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  module:         { type: String, required: true, default: 'linkedin', index: true },
  processingType: { type: String, required: true }, // 'single' | 'bulk'
  records: [{
    inputVal:     { type: String, default: "" },
    output:       { type: mongoose.Schema.Types.Mixed, default: null },
    status:       { type: String, default: 'done' }, // 'done' | 'failed'
    error:        { type: String, default: '' }
  }],
  fields:         [{ type: String }],
  jobName:        { type: String, default: "" },
  createdAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnrichHistory', EnrichHistorySchema);
