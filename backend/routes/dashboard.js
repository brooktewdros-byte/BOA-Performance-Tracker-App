const express = require('express');
const router = express.Router();
const KPIEntry = require('../models/KPIEntry');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    let data = {};

    if (user.role === 'ho_admin') {
      const entries = await KPIEntry.find({ status: 'approved' });
      const totalDeposit = entries.reduce((s, e) => s + e.depositMobilization, 0);
      const avgScore = entries.length ? entries.reduce((s, e) => s + e.weightedScore, 0) / entries.length : 0;
      const topPerformers = await KPIEntry.find({ status: 'approved' })
        .sort({ weightedScore: -1 }).limit(10).populate('employeeId', 'fullName');
      data = { summary: { totalDeposit, avgScore, totalEntries: entries.length }, topPerformers };
    } 
    else if (user.role === 'district_manager') {
      const entries = await KPIEntry.find({ districtId: user.districtId, status: 'approved' });
      const totalDeposit = entries.reduce((s, e) => s + e.depositMobilization, 0);
      const avgScore = entries.length ? entries.reduce((s, e) => s + e.weightedScore, 0) / entries.length : 0;
      data = { summary: { totalDeposit, avgScore, totalEntries: entries.length } };
    }
    else if (user.role === 'branch_manager') {
      const entries = await KPIEntry.find({ branchId: user.branchId, status: 'approved' });
      const totalDeposit = entries.reduce((s, e) => s + e.depositMobilization, 0);
      const avgScore = entries.length ? entries.reduce((s, e) => s + e.weightedScore, 0) / entries.length : 0;
      data = { summary: { totalDeposit, avgScore, totalEntries: entries.length } };
    }
    else if (user.role === 'employee') {
      const entries = await KPIEntry.find({ employeeId: user._id, status: 'approved' });
      const totalDeposit = entries.reduce((s, e) => s + e.depositMobilization, 0);
      const avgScore = entries.length ? entries.reduce((s, e) => s + e.weightedScore, 0) / entries.length : 0;
      data = { summary: { totalDeposit, avgScore, totalEntries: entries.length } };
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;