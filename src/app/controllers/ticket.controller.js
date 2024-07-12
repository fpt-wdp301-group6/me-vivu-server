const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const { ErrorWithStatus } = require('../../utils/error');
const Showtime = require('../models/Showtime');
const PayOS = require('@payos/node');
const { sendTicket } = require('../../services/sendTicket');

const buyTicket = asyncHandler(async (req, res) => {
    const session = req.session;
    const { showtime: showtimeId, seats } = req.body;

    const ticket = new Ticket(req.body);

    if (!seats.length) {
        throw new ErrorWithStatus('Không có ghế nào được chọn', 400);
    }

    const showtime = await Showtime.findById(showtimeId);
    if (seats.some((seat) => showtime.reservedSeats.includes(seat))) {
        throw new ErrorWithStatus('Ghế đã được đặt', 409);
    }

    ticket.user = req.user?.id;
    await ticket.save();

    session.endSession();
    res.status(201).json(ticket);
});

const createPaymentLink = asyncHandler(async (req, res) => {
    const session = req.session;
    const payOS = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new ErrorWithStatus('Không tìm thấy vé xem phim', 404);
    }

    const option = {
        orderCode: ticket.code,
        amount: ticket.total,
        description: `${ticket.name}`,
        returnUrl: req.body.returnUrl,
        cancelUrl: req.body.cancelUrl,
        buyerName: ticket.name,
        buyerEmail: ticket.email,
    };
    const paymentLink = await payOS.createPaymentLink(option);
    ticket.paymentLinkId = paymentLink.paymentLinkId;
    await ticket.save();
    await sendTicket(ticket._id);

    session.endSession();
    res.json({ data: paymentLink.checkoutUrl });
});

const receiveWebhook = asyncHandler(async (req, res) => {
    const { status, orderCode } = req.body.data;

    const ticket = await Ticket.findOne({ code: orderCode });
    switch (status) {
        case 'CANCELLED':
            ticket.status = 3;
            break;
        case 'PAID':
            ticket.status = 2;
            break;
        default:
            break;
    }
    await ticket?.save();
    await sendTicket(ticket._id);
    res.status(200).json({ data: ticket, message: 'Đã nhận webhook' });
});

module.exports = { buyTicket, createPaymentLink, receiveWebhook };
