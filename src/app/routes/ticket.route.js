const { Router } = require('express');
const { buyTicket, createPaymentLink, receiveWebhook } = require('../controllers/ticket.controller');

const router = Router();

router.post('/', buyTicket);
router.post('/:id/payment-link', createPaymentLink);
router.post('/receive-hook', receiveWebhook);

module.exports = router;
