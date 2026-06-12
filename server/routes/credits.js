const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Ensure all credits routes are authenticated
router.use(authMiddleware);

// Define default costs in case client doesn't pass one, or for validation
const ACTIONS_COST = {
  email: 1,
  phone: 10,
  linkedin: 5,
  validate: 1,
};

// GET /api/credits -> returns current balance
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ credits: user.credits, creditsUsed: user.creditsUsed });
  } catch (err) {
    console.error('Error fetching credits:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/credits/spend { action, cost } -> validates, deducts, and returns new balance
router.post('/spend', async (req, res) => {
  try {
    const { action, cost } = req.body;
    
    // Fall back to server config cost if not explicitly passed
    let requiredCost = typeof cost === 'number' ? cost : ACTIONS_COST[action];
    
    if (requiredCost === undefined || requiredCost === null) {
      return res.status(400).json({ error: 'Valid action or cost is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < requiredCost) {
      return res.status(402).json({ error: 'Out of credits', credits: user.credits });
    }

    user.credits = Math.max(0, user.credits - requiredCost);
    user.creditsUsed = (user.creditsUsed || 0) + requiredCost;
    await user.save();

    res.json({ credits: user.credits, creditsUsed: user.creditsUsed });
  } catch (err) {
    console.error('Error spending credits:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/credits/buy -> Add purchased credits to user balance and create notification
router.post('/buy', async (req, res) => {
  try {
    const { credits } = req.body;
    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return res.status(400).json({ error: 'Valid credits amount is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.credits = (user.credits || 0) + credits;
    await user.save();

    // Create Notification
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: user._id,
      title: `Successfully purchased ${credits.toLocaleString()} credits!`,
      target: null
    });

    res.json({ credits: user.credits, creditsUsed: user.creditsUsed });
  } catch (err) {
    console.error('Error buying credits:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
