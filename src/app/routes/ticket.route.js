const { Router } = require('express');
const {
    buyTicket,
    createPaymentLink,
    receiveWebhook,
    getTotalRevenuePerMonth,
} = require('../controllers/ticket.controller');

const router = Router();

router.post('/', buyTicket);
router.post('/:id/payment-link', createPaymentLink);
router.post('/receive-hook', receiveWebhook);
router.get('/revenue-per-month', getTotalRevenuePerMonth);

module.exports = router;
