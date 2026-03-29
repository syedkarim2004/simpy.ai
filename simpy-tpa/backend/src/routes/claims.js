const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');

// GET all claims with filters
router.get('/', async (req, res) => {
  try {
    const { stage, tpa } = req.query;
    const filter = {};
    if (stage) filter.currentStage = stage;
    if (tpa) filter.tpaName = tpa;

    const claims = await Claim.find(filter).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single claim with full history
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new claim
router.post('/', async (req, res) => {
  try {
    const newClaim = new Claim(req.body);
    const savedClaim = await newClaim.save();
    res.status(201).json(savedClaim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update claim stage
router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { currentStage: stage, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updatedClaim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
