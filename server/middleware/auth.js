const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token using Supabase JWT Secret
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

        // Find the user in MongoDB using the Supabase ID
        const user = await User.findOne({ supabaseId: decoded.sub });

        if (!user) {
            // If user not found in DB, we still attach the Supabase ID
            // This allows the /auth/sync endpoint to create the user
            req.user = { id: null, supabaseId: decoded.sub };
        } else {
            // Attach the MongoDB _id to req.user
            req.user = { id: user._id, supabaseId: user.supabaseId };
        }

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
