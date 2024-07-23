const { Router } = require('express');
const {
    buyTicket,
    createPaymentLink,
    receiveWebhook,
    getTickets,
    getTotalRevenuePerMonth,
    getCinemaTicketsCount,
    getTotalTickets,
} = require('../controllers/ticket.controller');
const { isUser, hasToken, isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', hasToken, buyTicket);
router.post('/:id/payment-link', createPaymentLink);
router.post('/receive-hook', receiveWebhook);
router.get('/me', isUser, getTickets);
router.get('/revenue-per-month', getTotalRevenuePerMonth);
router.get('/cinema/count', isCinema, getCinemaTicketsCount);
router.get('/cinema/total', isCinema, getTotalTickets);

module.exports = router;
