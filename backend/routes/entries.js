const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'Entry created' });
});

router.get('/branch/pending', (req, res) => {
  res.json([]);
});

router.put('/:entryId/branch-review', (req, res) => {
  res.json({ ok: true });
});

module.exports = router;