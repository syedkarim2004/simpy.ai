const mongoose = require('mongoose');

const PreAuthSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  submittedAt: { type: Date, default: Date.now },
  tatDeadline: Date,           // submittedAt + 1 hour
  tatBreached: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  authLetterNumber: String,
  initialApprovedAmount: Number,
  approvalConditions: String,
  approvedAt: Date,
  documents: {
    preAuthForm: { uploaded: { type: Boolean, default: false }, filename: String },
    idProof: { uploaded: { type: Boolean, default: false }, filename: String },
    insuranceCard: { uploaded: { type: Boolean, default: false }, filename: String },
    diagnosticReports: { uploaded: { type: Boolean, default: false }, filename: String },
    referralLetter: { uploaded: { type: Boolean, default: false }, filename: String },
    previousRecords: { uploaded: { type: Boolean, default: false }, filename: String },
    doctorNotes: { uploaded: { type: Boolean, default: false }, filename: String }
  }
});

module.exports = mongoose.model('PreAuth', PreAuthSchema);
