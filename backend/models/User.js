const mongoose = require('mongoose'); 
const userSchema = new mongoose.Schema({ employeeId: String, fullName: String, email: String, passwordHash: String, role: String, branchId: mongoose.Schema.Types.ObjectId, districtId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now } }); 
module.exports = mongoose.model('User', userSchema); 
