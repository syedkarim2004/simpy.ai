const express = require('express');
const router = express.Router();
const Discharge = require('../models/Discharge');
const Claim = require('../models/Claim');

// POST initiate discharge intimation
router.post('/', async (req, res) => {
  try {
    const { claimId, plannedDischargeTime, finalBillAmount } = req.body;
    
    const discharge = new Discharge({
      claimId,
      plannedDischargeTime,
      finalBillAmount,
      intimationSentAt: Date.now(),
      approvalWindowDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hour window
    });
    
    await discharge.save();
    
    // Update claim stage
    await Claim.findByIdAndUpdate(claimId, { currentStage: 'DISCHARGE_INTIMATED' });
    
    res.status(201).json(discharge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH approve discharge & record deductions
router.patch('/:id/approve', async (req, res) => {
  try {
    const { deductions, tpaPayable, patientPayable, totalDeductionAmount } = req.body;
    
    const discharge = await Discharge.findByIdAndUpdate(
      req.params.id,
      {
        status: 'APPROVED',
        deductions,
        tpaPayableAmount: tpaPayable,
        patientPayableAtCounter: patientPayable,
        totalDeductionAmount,
        approvalLetterGeneratedAt: Date.now()
      },
      { new: true }
    );
    
    await Claim.findByIdAndUpdate(discharge.claimId, { currentStage: 'DISCHARGE_APPROVED' });
    
    res.json(discharge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
