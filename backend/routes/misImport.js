const express = require('express');
const router = express.Router();

router.post('/auto-ingest', (req, res) => {
  res.json({ message: 'Ingested 0 entries' });
});

module.exports = router;