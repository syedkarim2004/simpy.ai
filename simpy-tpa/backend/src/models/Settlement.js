const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  utrNumber: { type: String, unique: true, sparse: true },
  amountReceived: Number,
  paymentDate: Date,
  paymentMode: { type: String, enum: ['NEFT', 'RTGS', 'Cheque'] },
  settlementLetterNumber: String,
  furtherDeductionAmount: { type: Number, default: 0 },
  furtherDeductionReason: String,     // Non-payable items found in audit
  isDisputed: { type: Boolean, default: false },
  disputeNotes: String,
  disputeRaisedAt: Date,
  lossAmount: Number,                 // furtherDeduction - recovered
  status: {
    type: String,
    enum: ['AWAITING_UTR', 'UTR_RECEIVED', 'DISPUTE_RAISED', 'CLOSED'],
    default: 'AWAITING_UTR'
  },
  closedAt: Date
});

module.exports = mongoose.model('Settlement', SettlementSchema);
