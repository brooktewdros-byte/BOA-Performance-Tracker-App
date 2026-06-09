require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User schema (copy from my earlier message, but simplified for now)
const userSchema = new mongoose.Schema({
  employeeId: String,
  fullName: String,
  email: String,
  passwordHash: String,
  role: String,
  branchId: mongoose.Schema.Types.ObjectId,
  districtId: mongoose.Schema.Types.ObjectId
});
const User = mongoose.model('User', userSchema);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  const hash = await bcrypt.hash('password123', 10);
  await User.create([
    { employeeId: 'EMP001', fullName: 'Test Employee', email: 'employee@test.com', passwordHash: hash, role: 'employee' },
    { employeeId: 'BM001', fullName: 'Branch Manager', email: 'bm@test.com', passwordHash: hash, role: 'branch_manager' },
    { employeeId: 'DM001', fullName: 'District Manager', email: 'dm@test.com', passwordHash: hash, role: 'district_manager' },
    { employeeId: 'HO001', fullName: 'Head Office Admin', email: 'ho@test.com', passwordHash: hash, role: 'ho_admin' }
  ]);
  console.log('Seeded');
  process.exit();
};
seed();