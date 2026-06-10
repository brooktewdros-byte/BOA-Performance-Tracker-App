const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    summary: {
      totalDeposit: 0,
      avgScore: 0,
      totalEntries: 0
    },
    topPerformers: []
  });
});

module.exports = router;