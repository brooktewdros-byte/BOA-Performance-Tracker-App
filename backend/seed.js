require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Branch = require('./models/Branch');
const District = require('./models/District');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    await Branch.deleteMany({});
    await District.deleteMany({});

    // District
    const district = new District({ name: 'Addis Ababa', code: 'AA001' });
    await district.save();

    // Branch
    const branch = new Branch({ name: 'Sealitemihiret Branch', code: 'SL001', districtId: district._id });
    await branch.save();

    const hash = await bcrypt.hash('password123', 10);

    const users = [
      { employeeId: 'EMP001', fullName: 'Test Employee', email: 'employee@test.com', passwordHash: hash, role: 'employee', branchId: branch._id, districtId: district._id },
      { employeeId: 'BM001', fullName: 'Branch Manager', email: 'bm@test.com', passwordHash: hash, role: 'branch_manager', branchId: branch._id, districtId: district._id },
      { employeeId: 'DM001', fullName: 'District Manager', email: 'dm@test.com', passwordHash: hash, role: 'district_manager', districtId: district._id },
      { employeeId: 'HO001', fullName: 'Head Office Admin', email: 'ho@test.com', passwordHash: hash, role: 'ho_admin' }
    ];

    for (const u of users) {
      await User.create(u);
    }

    console.log('✅ Seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();