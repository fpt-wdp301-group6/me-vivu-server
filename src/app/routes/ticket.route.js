const { Router } = require('express');
const { buyTicket } = require('../controllers/ticket.controller');

const router = Router();

router.post('/', buyTicket);

module.exports = router;
