const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');

router.get('/', auth, accountController.getAccounts);
router.post('/', auth, accountController.addAccount);
router.post('/transfer', auth, accountController.transferMoney);
router.put('/:id', auth, accountController.updateAccount);
router.delete('/:id', auth, accountController.deleteAccount);

module.exports = router;
