const mongoose = require('mongoose');

const startTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    req.session = session;
    next();
};

module.exports = { startTransaction };
