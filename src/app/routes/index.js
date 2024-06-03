const { startTransaction } = require('../middlewares/transaction');
const authRouter = require('./auth.route');
const cinemaRouter = require('./cinema.route');

const routes = (app) => {
    app.use(startTransaction);
    app.use('/api/auth', authRouter);
    app.use('/api/cinemas', cinemaRouter);
};

module.exports = routes;
