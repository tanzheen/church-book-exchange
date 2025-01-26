const express = require('express');
const router = express.Router();
const {
  createExchange,
  getMyExchanges,
  updateExchangeStatus,
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getMyExchanges)
  .post(createExchange);

router.route('/:id')
  .put(updateExchangeStatus);

module.exports = router; 