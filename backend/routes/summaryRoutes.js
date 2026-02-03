const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/categories', auth, transactionController.getCategorySummary);
router.get('/dashboard', auth, transactionController.getDashboard);

module.exports = router;
