const express = require('express');
const router = express.Router();
const Enhancement = require('../models/Enhancement');
const Claim = require('../models/Claim');

// POST submit enhancement request
router.post('/', async (req, res) => {
  try {
    const enhancement = new Enhancement({
      ...req.body,
      submittedAt: Date.now()
    });
    
    const savedEnhancement = await enhancement.save();
    
    // Update claim stage
    await Claim.findByIdAndUpdate(req.body.claimId, { currentStage: 'ENHANCEMENT_REQUESTED' });
    
    res.status(201).json(savedEnhancement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH resolve enhancement (approve/reject)
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { status, approvedAmount, letterNo } = req.body;
    const enhancement = await Enhancement.findByIdAndUpdate(
      req.params.id,
      {
        status,
        enhancementApproved: approvedAmount,
        totalEnhancedAuthAmount: approvedAmount, // In reality, sum original + enhanced
        resolvedAt: Date.now()
      },
      { new: true }
    );
    
    if (status === 'APPROVED') {
      await Claim.findByIdAndUpdate(enhancement.claimId, { currentStage: 'ENHANCEMENT_APPROVED' });
    }
    
    res.json(enhancement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
