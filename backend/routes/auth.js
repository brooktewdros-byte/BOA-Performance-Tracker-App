const express = require('express'); 
const router = express.Router(); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const User = require('../models/User'); 
router.post('/login', async (req, res) = try { const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(401).json({ error: 'Invalid credentials' }); const valid = await bcrypt.compare(req.body.password, user.passwordHash); if (!valid) return res.status(401).json({ error: 'Invalid credentials' }); const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); res.json({ token, user: { id: user._id, name: user.fullName, role: user.role } }); } catch(err) { res.status(500).json({ error: err.message }); } }); 
router.get('/me', async (req, res) = try { const token = req.headers.authorization?.split(' ')[1]; if (!token) return res.status(401).json({ error: 'No token' }); const decoded = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(decoded.userId).select('-passwordHash'); res.json(user); } catch(err) { res.status(401).json({ error: 'Invalid token' }); } }); 
module.exports = router; 
