const express = require('express');
const router = express.Router();

router.get('/districts', (req, res) => res.json([]));
router.get('/branches', (req, res) => res.json([]));
router.get('/users', (req, res) => res.json([]));

module.exports = router;