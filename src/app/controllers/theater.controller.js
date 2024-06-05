const asyncHandler = require('express-async-handler');
const Theater = require('../models/Theater');
const { ErrorWithStatus } = require('../../utils/error');
const APIFeatures = require('../../utils/APIFeatures');

const createTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const { name } = req.body;
    const theater = await Theater.findOneWithDeleted({ name });
    if (theater) {
        throw new ErrorWithStatus('Rạp phim này đã được đăng ký', 409);
    }

    const newTheater = await Theater.create({ ...req.body, cinema: req.user.cinema });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: newTheater, message: 'Tạo rạp chiếu phim thành công' });
});

const updateTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOneAndUpdateWithDeleted(
        { _id: req.params.id, cinema: req.user.cinema },
        { $set: req.body },
        { new: true },
    );
    if (!theater) {
        throw new ErrorWithStatus('Rạp phim chưa được đăng ký', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theater, message: 'Rạp phim được cập nhật thành công' });
});

const deleteTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOne({ _id: req.params.id, cinema: req.user.cinema });
    if (!theater) {
        throw new ErrorWithStatus('Rạp phim chưa được đăng ký', 404);
    }

    await theater.delete();
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theater, message: 'Rạp phim được xóa thành công' });
});

const restoreTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOneDeleted({ _id: req.params.id, cinema: req.user.cinema });
    if (!theater) {
        throw new ErrorWithStatus('Không có rạp phim', 404);
    }

    await theater.restore();

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theater, message: 'Rạp phim được khôi phục thành công' });
});

const getTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOne({ slug: req.params.slug });
    if (!theater) {
        throw new ErrorWithStatus('Không có hệ thống rạp chiếu phim', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theater });
});

const getTheaterWithDeleted = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOneWithDeleted({ _id: req.params.id, cinema: req.user.cinema });
    if (!theater) {
        throw new ErrorWithStatus('Không có rạp phim', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theater });
});

const getTheaters = asyncHandler(async (req, res) => {
    const session = req.session;
    const features = new APIFeatures(Theater, req.query).search('name').filter().sort().limitFields().paginate();
    const [theaters, total] = await Promise.all([features.query, features.total]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theaters, total });
});

const getTheatersAll = asyncHandler(async (req, res) => {
    const session = req.session;
    req.query.cinema = req.user.cinema;
    const features = new APIFeatures(Theater, req.query)
        .deleted()
        .search('name')
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const [theaters, total] = await Promise.all([features.query, features.total]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: theaters, total });
});

module.exports = {
    createTheater,
    updateTheater,
    deleteTheater,
    restoreTheater,
    getTheater,
    getTheaterWithDeleted,
    getTheaters,
    getTheatersAll,
};
