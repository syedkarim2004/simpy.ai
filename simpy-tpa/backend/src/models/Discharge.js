const mongoose = require('mongoose');

const DischargeSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  plannedDischargeTime: Date,
  intimationSentAt: Date,
  approvalWindowDeadline: Date,       // intimationSentAt + 3 hours
  finalBillAmount: Number,
  totalAuthAmount: Number,            // Pre-auth + all enhancements combined
  tpaPayableAmount: Number,
  deductions: {
    food: { amount: Number, included: { type: Boolean, default: false } },
    toiletries: { amount: Number, included: { type: Boolean, default: false } },
    attendant: { amount: Number, included: { type: Boolean, default: false } },
    telephone: { amount: Number, included: { type: Boolean, default: false } },
    registration: { amount: Number, included: { type: Boolean, default: false } },
    laundry: { amount: Number, included: { type: Boolean, default: false } },
    opdCharges: { amount: Number, included: { type: Boolean, default: false } },
    other: { amount: Number, description: String }
  },
  totalDeductionAmount: Number,
  copayAmount: Number,
  patientPayableAtCounter: Number,
  dischargeCondition: {
    type: String,
    enum: ['Stable / Recovered', 'LAMA', 'Referred to higher centre', 'Death']
  },
  approvalLetterNumber: String,
  approvalLetterGeneratedAt: Date,
  status: {
    type: String,
    enum: ['INTIMATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'INTIMATED'
  },
  documents: {
    dischargeSummary: { uploaded: { type: Boolean, default: false }, filename: String },
    finalBill: { uploaded: { type: Boolean, default: false }, filename: String },
    icps: { uploaded: { type: Boolean, default: false }, filename: String },
    investigationReports: { uploaded: { type: Boolean, default: false }, filename: String },
    otNotes: { uploaded: { type: Boolean, default: false }, filename: String }
  }
});

module.exports = mongoose.model('Discharge', DischargeSchema);
