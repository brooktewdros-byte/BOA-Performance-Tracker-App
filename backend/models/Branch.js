const mongoose = require('mongoose'); 
const branchSchema = new mongoose.Schema({ name: String, code: String, districtId: mongoose.Schema.Types.ObjectId, isActive: { type: Boolean, default: true } }); 
module.exports = mongoose.model('Branch', branchSchema); 
