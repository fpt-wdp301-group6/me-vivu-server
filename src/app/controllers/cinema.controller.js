const asyncHandler = require('express-async-handler');
const Cinema = require('../models/Cinema');
const { ErrorWithStatus } = require('../../utils/error');
const APIFeatures = require('../../utils/APIFeatures');

const createCinema = asyncHandler(async (req, res) => {
    const session = req.session;
    const { name } = req.body;
    const cinema = await Cinema.findOneWithDeleted({ name });
    if (cinema) {
        throw new ErrorWithStatus('Hệ thống rạp chiếu phim này đã được đăng ký', 409);
    }

    const newCinema = new Cinema(req.body);
    await newCinema.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: newCinema, message: 'Đăng ký hệ thống rạp chiếu phim thành công' });
});

const updateCinema = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, session });
    if (!cinema) {
        throw new ErrorWithStatus('Hệ thống rạp chiếu phim chưa được đăng ký', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: cinema, message: 'Hệ thống rạp chiếu phim được cập nhật thành công' });
});

const deleteCinema = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findById(req.params.id).session(session);
    if (!cinema) {
        throw new ErrorWithStatus('Hệ thống rạp chiếu phim chưa được đăng ký', 404);
    }

    await cinema.delete();
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: cinema, message: 'Hệ thống rạp chiếu phim được xóa thành công' });
});

const restoreCinema = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findOneDeleted({ _id: req.params.id }).session(session);
    if (!cinema) {
        throw new ErrorWithStatus('Không có hệ thống', 404);
    }

    await cinema.restore();

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: cinema, message: 'Hệ thống rạp chiếu phim được khôi phục thành công' });
});

const getCinema = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findOne({ slug: req.params.slug });
    if (!cinema) {
        throw new ErrorWithStatus('Không có hệ thống rạp chiếu phim', 404);
    }

    session.endSession();
    res.status(201).json({ data: cinema });
});

const getCinemaWithDeleted = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findOneWithDeleted({ _id: req.params.id });
    if (!cinema) {
        throw new ErrorWithStatus('Không có hệ thống rạp chiếu phim', 404);
    }

    session.endSession();
    res.status(201).json({ data: cinema });
});

const getCinemas = asyncHandler(async (req, res) => {
    const session = req.session;
    const features = new APIFeatures(Cinema, req.query).search('name').filter().sort().limitFields().paginate();
    const [cinemas, total] = await Promise.all([features.query, features.total]);

    session.endSession();
    res.status(201).json({ data: cinemas, total });
});

const getCinemasAll = asyncHandler(async (req, res) => {
    const session = req.session;
    const features = new APIFeatures(Cinema, req.query)
        .deleted()
        .search('name')
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const [cinemas, total] = await Promise.all([features.query, features.total]);

    session.endSession();
    res.status(201).json({ data: cinemas, total });
});

module.exports = {
    createCinema,
    updateCinema,
    deleteCinema,
    restoreCinema,
    getCinema,
    getCinemaWithDeleted,
    getCinemas,
    getCinemasAll,
};
