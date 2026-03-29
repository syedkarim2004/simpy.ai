const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  uhid: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  patientDOB: Date,
  policyNumber: { type: String, required: true },
  tpaName: { 
    type: String, 
    enum: ['MediAssist', 'Vidal Health', 'MD India', 'Raksha TPA', 'Paramount', 'CGHS', 'ECHS'],
    required: true 
  },
  insuranceCompany: String,
  diagnosis: String,
  icdCode: String,
  proposedTreatment: String,
  admissionType: { type: String, enum: ['Planned', 'Emergency', 'Day Care'] },
  estimatedCost: Number,
  currentStage: {
    type: String,
    enum: [
      'PRE_AUTH_SUBMITTED',
      'PRE_AUTH_APPROVED',
      'ADMITTED',
      'ENHANCEMENT_REQUESTED',
      'ENHANCEMENT_APPROVED',
      'DISCHARGE_INTIMATED',
      'DISCHARGE_APPROVED',
      'SETTLED',
      'CLOSED'
    ],
    default: 'PRE_AUTH_SUBMITTED'
  },
  assignedTPACoordinator: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', ClaimSchema);
