const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const { ErrorWithStatus } = require('../../utils/error');
const Showtime = require('../models/Showtime');

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

    await ticket.save();

    session.endSession();
    res.status(201).json(ticket);
});

module.exports = { buyTicket };
