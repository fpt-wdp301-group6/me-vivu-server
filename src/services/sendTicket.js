const asyncHandler = require('express-async-handler');
const Ticket = require('../app/models/Ticket');
const getMovieDetails = require('../config/api');
const moment = require('moment');
const { sendMail, replacePlaceholder } = require('../utils/mail');

const paymentStr = {
    1: 'Đang chờ thanh toán',
    2: 'Đã thanh toán',
    3: 'Đã hủy',
    4: 'Đã hoàn trả',
};

const sendTicket = asyncHandler(async (ticketId) => {
    const ticket = await Ticket.findById(ticketId)
        .populate({
            path: 'showtime',
            populate: {
                path: 'room',
            },
        })
        .populate(['theater', 'foods.item', 'seats']);
    const movie = await getMovieDetails(ticket.showtime.movieId);

    if (ticket) {
        const options = {
            movieTitle: movie.title,
            showDate: moment(ticket.showtime.startAt).format('DD/MM/YYYY'),
            startAt: moment(ticket.showtime.startAt).format('HH:mm'),
            endAt: moment(ticket.showtime.endAt).format('HH:mm'),
            theater: ticket.theater.name,
            theaterAddress: ticket.theater.address.detail,
            room: ticket.showtime.room.name,
            seats: ticket.seats.map((seat) => seat.name).join(', '),
            foods: '',
            status: paymentStr[ticket.status],
            total: ticket.total,
            payment: '',
        };

        for (let i = 0; i < ticket.foods.length; i++) {
            options.foods += `<tr>
                                ${
                                    i === 0
                                        ? `<td rowspan=${ticket.foods.length}><strong style="white-space: nowrap">Bắp nước</strong></td>`
                                        : ''
                                }
                                <td>${ticket.foods[i].item.name}</td>
                                <td>${ticket.foods[i].quantity}</td>
                            </tr>`;
        }

        if (ticket.status === 1) {
            options.payment = `<tr>
                            <td colspan="2" align="center" style="padding-top: 12px">
                                <a
                                    href="https://localhost:3000/${ticket.paymentLinkId}"
                                    style="
                                        display: inline-block;
                                        padding: 16px;
                                        background-color: #222222;
                                        border-radius: 8px;
                                        color: white;
                                        text-decoration: none;
                                    "
                                >
                                    Thanh toán ngay
                                </a>
                            </td>
                        </tr>`;
        }
        const emailTemplate = replacePlaceholder('ticket.html', options);

        sendMail({ to: ticket.email, subject: 'Thông tin đặt vé tại meVivu', html: emailTemplate });
    }
});

module.exports = { sendTicket };
