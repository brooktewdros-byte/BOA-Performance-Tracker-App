const express = require('express');
const router = express.Router();
const KPIEntry = require('../models/KPIEntry');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Employee: Create new entry
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Only employees can create entries' });
    }
    const entryData = {
      ...req.body,
      employeeId: req.user._id,
      branchId: req.user.branchId,
      districtId: req.user.districtId,
      status: 'pending_branch'
    };
    const entry = new KPIEntry(entryData);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee: Get my entries
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ error: 'Unauthorized' });
    const entries = await KPIEntry.find({ employeeId: req.user._id }).sort({ reportingDate: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Branch Manager: Get pending entries for their branch
router.get('/branch/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'branch_manager') return res.status(403).json({ error: 'Unauthorized' });
    const entries = await KPIEntry.find({
      branchId: req.user.branchId,
      status: 'pending_branch'
    }).populate('employeeId', 'fullName employeeId email');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Branch Manager: Review entry
router.put('/:entryId/branch-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'branch_manager') return res.status(403).json({ error: 'Unauthorized' });
    const { action, comments } = req.body;
    const entry = await KPIEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ error: 'Not your branch' });
    }
    entry.branchReview = { reviewedBy: req.user._id, reviewedAt: new Date(), comments, action };
    entry.status = action === 'approved' ? 'pending_district' : 'rejected_branch';
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// District Manager: Get pending entries for their district
router.get('/district/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district_manager') return res.status(403).json({ error: 'Unauthorized' });
    const entries = await KPIEntry.find({
      districtId: req.user.districtId,
      status: 'pending_district'
    }).populate('employeeId', 'fullName employeeId email');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// District Manager: Review entry
router.put('/:entryId/district-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district_manager') return res.status(403).json({ error: 'Unauthorized' });
    const { action, comments } = req.body;
    const entry = await KPIEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.districtId.toString() !== req.user.districtId.toString()) {
      return res.status(403).json({ error: 'Not your district' });
    }
    entry.districtReview = { reviewedBy: req.user._id, reviewedAt: new Date(), comments, action };
    entry.status = action === 'approved' ? 'pending_ho' : 'rejected_district';
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Head Office: Get pending entries
router.get('/ho/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ho_admin') return res.status(403).json({ error: 'Unauthorized' });
    const entries = await KPIEntry.find({ status: 'pending_ho' }).populate('employeeId', 'fullName employeeId email');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Head Office: Review entry
router.put('/:entryId/ho-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ho_admin') return res.status(403).json({ error: 'Unauthorized' });
    const { action, comments } = req.body;
    const entry = await KPIEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    entry.hoReview = { reviewedBy: req.user._id, reviewedAt: new Date(), comments, action };
    entry.status = action === 'approved' ? 'approved' : 'rejected_ho';
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;