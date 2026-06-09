const mongoose = require('mongoose'); 
const districtSchema = new mongoose.Schema({ name: String, code: String, isActive: { type: Boolean, default: true } }); 
module.exports = mongoose.model('District', districtSchema); 
