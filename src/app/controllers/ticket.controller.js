const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const { ErrorWithStatus } = require('../../utils/error');
const Showtime = require('../models/Showtime');
const PayOS = require('@payos/node');
const { sendTicket } = require('../../services/sendTicket');
const getMovieDetails = require('../../config/api');

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
    const { orderCode } = req.body.data;

    const ticket = await Ticket.findOne({ code: orderCode });
    if (ticket) {
        const showtime = await Showtime.findById(ticket.showtime);
        ticket.seats.forEach((seat) => showtime.reservedSeats.push(seat));
        ticket.status = 2;

        const ticketsToUpdate = await Ticket.find({
            showtime: ticket.showtime,
            status: 1,
            seats: { $in: ticket.seats },
            _id: { $ne: ticket._id },
        });

        const updatePromises = ticketsToUpdate.map((t) => {
            t.status = 3;
            t.paymentLinkId = null;
            return t.save();
        });

        await Promise.all([showtime.save(), await ticket.save(), await sendTicket(ticket._id), ...updatePromises]);
    }

    res.status(200).json({ data: ticket, message: 'Đã nhận webhook' });
});

const getTickets = asyncHandler(async (req, res) => {
    const session = req.session;

    const tickets = await Ticket.find({ user: req.user?.id })
        .populate([
            {
                path: 'theater',
                select: 'name',
                populate: {
                    path: 'cinema',
                    select: 'logo',
                },
            },
            {
                path: 'showtime',
                select: ['movieId', 'startAt', 'endAt'],
                populate: { path: 'room', select: 'name' },
            },
        ])
        .sort('-createdAt');

    const movieCache = {};
    const updatedTickets = await Promise.all(
        tickets.map(async (ticket) => {
            const ticketMap = ticket._doc;
            const movieId = ticket.showtime.movieId;

            if (!movieCache[movieId]) {
                movieCache[movieId] = await getMovieDetails(movieId);
            }

            ticketMap.showtime._doc.movie = movieCache[movieId];
            return ticketMap;
        }),
    );

    session.endSession();
    res.json({ data: updatedTickets });
});

const getTotalRevenuePerMonth = asyncHandler(async (req, res) => {
    const revenueData = await Ticket.aggregate([
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalRevenue: { $sum: '$total' },
            },
        },
        {
            $sort: { _id: 1 }, // Sort by month (ascending)
        },
    ]);

    const months = revenueData.map((month) => month._id);
    const revenues = revenueData.map((revenue) => revenue.totalRevenue);
    const monthlyRevenues = { months, revenues };
    res.status(200).json({ data: monthlyRevenues, message: 'Lấy doanh thu của mỗi tháng thành công!' });
});

module.exports = { buyTicket, createPaymentLink, receiveWebhook, getTotalRevenuePerMonth, getTickets };
