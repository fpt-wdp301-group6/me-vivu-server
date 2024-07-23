const { Router } = require('express');
const {
    buyTicket,
    createPaymentLink,
    receiveWebhook,
    getTickets,
    getTotalRevenuePerMonth,
} = require('../controllers/ticket.controller');
const { isUser, hasToken } = require('../middlewares/authenticate');

const router = Router();

router.post('/', hasToken, buyTicket);
router.post('/:id/payment-link', createPaymentLink);
router.post('/receive-hook', receiveWebhook);
router.get('/me', isUser, getTickets);
router.get('/revenue-per-month', getTotalRevenuePerMonth);

module.exports = router;
