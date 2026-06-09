const jwt = require('jsonwebtoken'); 
module.exports = async (req, res, next) = try { const token = req.headers.authorization?.split(' ')[1]; if (!token) throw new Error(); const decoded = jwt.verify(token, process.env.JWT_SECRET); req.userId = decoded.userId; next(); } catch(err) { res.status(401).json({ error: 'Unauthorized' }); } }; 
