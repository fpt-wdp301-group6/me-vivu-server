// eslint-disable-next-line no-unused-vars
const error = async (err, req, res, next) => {
    if (req.session) {
        await req.session.abortTransaction();
        req.session.endSession();
    }

    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Đã có lỗi xảy ra!';
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
};

module.exports = { error };
