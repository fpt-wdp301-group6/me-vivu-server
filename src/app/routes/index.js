const { startTransaction } = require('../middlewares/transaction');
const authRouter = require('./auth.route');
const addressRouter = require('./address.route');
const cinemaRouter = require('./cinema.route');
const theaterRouter = require('./theater.route');

const routes = (app) => {
    app.use(startTransaction);
    app.use('/api/auth', authRouter);
    app.use('/api/address', addressRouter);
    app.use('/api/cinemas', cinemaRouter);
    app.use('/api/theaters', theaterRouter);
};

module.exports = routes;
