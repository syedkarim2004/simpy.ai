const mongoose = require('mongoose');

const EnhancementSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  originalAuthAmount: Number,
  provisionalBillAmount: Number,      // Current bill from HIS
  enhancementRequested: Number,       // Additional amount asked
  enhancementApproved: Number,        // What TPA approved
  totalEnhancedAuthAmount: Number,    // New total auth limit
  reason: {
    type: String,
    enum: [
      'Prolonged hospital stay',
      'Complications / additional surgery',
      'ICU requirement (unplanned)',
      'Implants / consumables cost increase',
      'Change in diagnosis'
    ]
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'PARTIAL', 'REJECTED'],
    default: 'PENDING'
  },
  doctorNote: String,
  doctorName: String,
  doctorRegNo: String,
  documents: {
    provisionalBill: { uploaded: { type: Boolean, default: false }, filename: String },     // MANDATORY
    doctorNote: { uploaded: { type: Boolean, default: false }, filename: String },          // MANDATORY
    labReports: { uploaded: { type: Boolean, default: false }, filename: String },           // MANDATORY
    otNotes: { uploaded: { type: Boolean, default: false }, filename: String },              // MANDATORY
    icuRecord: { uploaded: { type: Boolean, default: false }, filename: String },
    nursingNotes: { uploaded: { type: Boolean, default: false }, filename: String },
    radiologyReports: { uploaded: { type: Boolean, default: false }, filename: String }
  },
  submittedAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

module.exports = mongoose.model('Enhancement', EnhancementSchema);
