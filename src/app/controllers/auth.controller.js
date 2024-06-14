const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorWithStatus } = require('../../utils/error');

const register = asyncHandler(async (req, res) => {
    const session = req.session;
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw new ErrorWithStatus('Email đã được đăng ký', 409);
    }

    const newUser = new User(req.body);
    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: newUser.toJSON(), message: 'Đăng ký tài khoản thành công' });
});

const login = asyncHandler(async (req, res) => {
    const session = req.session;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).session(session);
    if (!user) {
        throw new ErrorWithStatus('Email chưa được đăng ký', 400);
    }
    if (!(await user.isPasswordMatched(password))) {
        throw new ErrorWithStatus('Mật khẩu không đúng', 400);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    await session.commitTransaction();
    session.endSession();
    res.status(200)
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            path: '/api/auth',
            secure: true, // https
        })
        .json({ data: { ...user.toJSON(), token: accessToken }, message: 'Đăng nhập thành công' });
});

const loginByOthers = asyncHandler(async (req, res) => {
    const session = req.session;
    const { user, providerId } = req.body;
    let googleUser = await User.findOne({ email: user.email }).session(session);

    if (googleUser) {
        if (providerId !== googleUser.providerId) {
            throw new ErrorWithStatus('Email đã được đăng ký bằng một phương thức khác', 400);
        }
        googleUser.name = user.displayName;
        googleUser.phone = user.phoneNumber;
        googleUser.avatar = user.photoURL;
    } else {
        googleUser = await User.create({
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber,
            avatar: user.photoURL,
            isVerified: user.emailVerified,
            providerId,
        });
    }

    const accessToken = googleUser.generateAccessToken();
    const refreshToken = googleUser.generateRefreshToken();
    googleUser.refreshToken = refreshToken;
    await googleUser.save();

    await session.commitTransaction();
    session.endSession();

    res.status(200)
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            path: '/api/auth',
            secure: true, // https
        })
        .json({ data: { ...googleUser.toJSON(), token: accessToken }, message: 'Đăng nhập thành công' });
});

const refreshToken = asyncHandler(async (req, res, next) => {
    const session = req.session;
    const refreshToken = req.signedCookies.refreshToken;
    if (!refreshToken) throw new ErrorWithStatus('Vui lòng đăng nhập', 400);

    const user = await User.findOne({ refreshToken }).session(session);
    if (!user) throw new ErrorWithStatus('Không tồn tài người dùng', 404);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, decoded) => {
        if (err || !user._id.equals(decoded.id)) return next(new ErrorWithStatus('Đã có lỗi với refresh token', 400));
        const token = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save();

        await session.commitTransaction();
        session.endSession();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            path: '/api/auth',
            secure: true, //https
        }).json({ token });
    });
});

const logout = asyncHandler(async (req, res) => {
    const session = req.session;
    const refreshToken = req.signedCookies.refreshToken;
    await User.findOneAndUpdate(
        { refreshToken },
        {
            refreshToken: '',
        },
        { session: session },
    );

    await session.commitTransaction();
    session.endSession();
    res.clearCookie('refreshToken', {
        httpOnly: true,
        signed: true,
        sameSite: 'none',
        path: '/api/auth',
        secure: true, //https
    })
        .status(200)
        .json({ message: 'Đăng xuất thành công' });
});

const loginByRefreshToken = asyncHandler(async (req, res, next) => {
    const session = req.session;
    const refreshToken = req.signedCookies.refreshToken;
    if (!refreshToken) throw new ErrorWithStatus('Vui lòng đăng nhập', 400);

    const user = await User.findOne({ refreshToken }).session(session);
    if (!user) throw new ErrorWithStatus('Không tồn tài người dùng!', 404);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, decoded) => {
        if (err || !user._id.equals(decoded.id)) return next(new ErrorWithStatus('Đã có lỗi với refresh token', 400));
        const token = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save();

        await session.commitTransaction();
        session.endSession();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            path: '/api/auth',
            secure: true, //https
        }).json({ data: { token, ...user.toJSON() }, message: 'Đăng nhập thành công' });
    });
});

module.exports = { register, login, refreshToken, logout, loginByRefreshToken, loginByOthers };
