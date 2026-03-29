const express = require('express');
const router = express.Router();
const PreAuth = require('../models/PreAuth');
const Claim = require('../models/Claim');

// POST submit new pre-auth
router.post('/', async (req, res) => {
  try {
    const { claimId, documents } = req.body;
    
    // Create pre-auth record
    const preAuth = new PreAuth({
      claimId,
      submittedAt: Date.now(),
      tatDeadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TAT
      documents
    });
    
    const savedPreAuth = await preAuth.save();
    
    // Update claim stage
    await Claim.findByIdAndUpdate(claimId, { currentStage: 'PRE_AUTH_SUBMITTED' });
    
    res.status(201).json(savedPreAuth);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET pre-auth for a claim
router.get('/:claimId', async (req, res) => {
  try {
    const preAuth = await PreAuth.findOne({ claimId: req.params.claimId });
    if (!preAuth) return res.status(404).json({ error: 'Pre-auth not found for this claim' });
    res.json(preAuth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH record TPA approval
router.patch('/:id/approve', async (req, res) => {
  try {
    const { approvedAmount, authLetterNo, conditions } = req.body;
    const preAuth = await PreAuth.findByIdAndUpdate(
      req.params.id,
      {
        status: 'APPROVED',
        initialApprovedAmount: approvedAmount,
        authLetterNumber: authLetterNo,
        approvalConditions: conditions,
        approvedAt: Date.now()
      },
      { new: true }
    );
    
    // Update claim stage to APPROVED
    await Claim.findByIdAndUpdate(preAuth.claimId, { currentStage: 'PRE_AUTH_APPROVED' });
    
    res.json(preAuth);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
