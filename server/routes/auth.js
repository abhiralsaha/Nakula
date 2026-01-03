const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Sync Supabase User with MongoDB
// POST /api/auth/sync
router.post('/sync', auth, async (req, res) => {
    try {
        // req.user.supabaseId comes from the auth middleware
        let user = await User.findOne({ supabaseId: req.user.supabaseId });

        if (!user) {
            // Create new user if not exists
            user = new User({
                supabaseId: req.user.supabaseId,
                username: req.body.email?.split('@')[0] || 'User',
                email: req.body.email,
                mobileNumber: req.body.phone,
                isMobileVerified: !!req.body.phone_confirmed_at,
                points: 0,
                streak: 0,
                lastActive: new Date()
            });
            await user.save();
        } else {
            // Update existing user info if changed
            if (req.body.phone && user.mobileNumber !== req.body.phone) {
                user.mobileNumber = req.body.phone;
                user.isMobileVerified = !!req.body.phone_confirmed_at;
                await user.save();
            }
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User Data
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findOne({ supabaseId: req.user.supabaseId });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Preferences and Attributes
router.put('/preferences', auth, async (req, res) => {
    try {
        const { theme, notificationChannels, mobileNumber } = req.body;
        const user = await User.findOne({ supabaseId: req.user.supabaseId });

        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (theme) user.theme = theme;
        if (notificationChannels) user.notificationChannels = notificationChannels;
        if (mobileNumber) {
            user.mobileNumber = mobileNumber;
            // logic to verify mobile could go here, for now assuming client handles verification flow
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
