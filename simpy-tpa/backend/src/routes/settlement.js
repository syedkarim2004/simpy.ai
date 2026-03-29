const express = require('express');
const router = express.Router();
const Settlement = require('../models/Settlement');
const Claim = require('../models/Claim');

// POST record UTR settlement
router.post('/', async (req, res) => {
  try {
    const settlement = new Settlement({
      ...req.body,
      status: 'UTR_RECEIVED'
    });
    
    await settlement.save();
    
    // Update claim stage
    await Claim.findByIdAndUpdate(req.body.claimId, { currentStage: 'SETTLED' });
    
    res.status(201).json(settlement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET reconciliation report data
router.get('/reconciliation', async (req, res) => {
  try {
    const settlements = await Settlement.find().populate('claimId');
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH raise dispute
router.patch('/:id/dispute', async (req, res) => {
  try {
    const settlement = await Settlement.findByIdAndUpdate(
      req.params.id,
      {
        status: 'DISPUTE_RAISED',
        isDisputed: true,
        disputeNotes: req.body.notes,
        disputeRaisedAt: Date.now()
      },
      { new: true }
    );
    res.json(settlement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
