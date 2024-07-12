const { startTransaction } = require('../middlewares/transaction');
const authRouter = require('./auth.route');
const addressRouter = require('./address.route');
const cinemaRouter = require('./cinema.route');
const foodRouter = require('./food.route');
const roomRouter = require('./room.route');
const showtimeRouter = require('./showtime.route');
const theaterRouter = require('./theater.route');
const ticketRouter = require('./ticket.route');
const testRouter = require('./test.route');

const routes = (app) => {
    app.use(startTransaction);
    app.use('/api/auth', authRouter);
    app.use('/api/address', addressRouter);
    app.use('/api/cinemas', cinemaRouter);
    app.use('/api/foods', foodRouter);
    app.use('/api/rooms', roomRouter);
    app.use('/api/showtimes', showtimeRouter);
    app.use('/api/theaters', theaterRouter);
    app.use('/api/tickets', ticketRouter);
    app.use('/api/test', testRouter);
};

module.exports = routes;
