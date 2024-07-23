const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { ErrorWithStatus } = require('../../utils/error');
const { UserRole } = require('../../utils/constants');

const hasToken = asyncHandler((req, res, next) => {
    const token = req.header('Authorization')?.startsWith('Bearer') && req.header('Authorization').split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (!err) req.user = user;
        });
    }
    next();
});

const isUser = asyncHandler((req, res, next) => {
    const token = req.header('Authorization')?.startsWith('Bearer') && req.header('Authorization').split(' ')[1];
    if (!token) {
        throw new ErrorWithStatus('Vui lòng đăng nhập', 401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) throw new ErrorWithStatus('Token đã hết hạn', 401);
        req.user = user;
        next();
    });
});

const isCinema = asyncHandler((req, res, next) => {
    isUser(req, res, () => {
        if (req.user.role === UserRole.Cinema && req.user.cinema) {
            next();
        } else {
            throw new ErrorWithStatus('Bạn không có quyền thực thi', 403);
        }
    });
});

const isAdmin = asyncHandler((req, res, next) => {
    isUser(req, res, () => {
        if (req.user.role === UserRole.Admin) {
            next();
        } else {
            throw new ErrorWithStatus('Bạn không có quyền thực thi', 403);
        }
    });
});

module.exports = { isUser, isCinema, isAdmin, hasToken };
