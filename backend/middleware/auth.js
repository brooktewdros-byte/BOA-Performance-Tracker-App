const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) throw new Error();
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};