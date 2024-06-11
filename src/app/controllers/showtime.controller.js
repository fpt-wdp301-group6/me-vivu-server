const asyncHandler = require('express-async-handler');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const { ErrorWithStatus } = require('../../utils/error');
const getMovieDetails = require('../../config/api');

const createShowtime = asyncHandler(async (req, res) => {
    const session = req.session;
    const { theaterId, movieId, startAt } = req.body;
    const theater = await Theater.findOne({ _id: theaterId, cinema: req.user.cinema }).session(session);

    const movie = await getMovieDetails(movieId);
    if (!movie) {
        throw new ErrorWithStatus('Phim không tìm thấy', 404);
    }
    req.body.endAt = new Date(startAt) + movie.runtime;

    const showtime = new Showtime(req.body);
    theater.showtimes.push(showtime);
    await Promise.all([showtime.save({ session }), theater.save({ session })]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: showtime, message: 'Combo bắp nước được tạo thành công' });
});

const updateShowtime = asyncHandler(async (req, res) => {
    // TODO
});

const deleteShowtime = asyncHandler(async (req, res) => {
    // TODO
});

const getShowtimesByTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const { date } = req.query;

    const start = new Date(date || '');
    const end = new Date(date + 1);
    end.setUTCHours(23, 59, 59, 999);

    const theater = await Theater.findById(req.params.theaterId)
        .populate({
            path: 'showtimes',
            match: {
                startAt: { $gte: start },
            },
            populate: {
                path: 'room',
            },
        })
        .exec();
    if (!theater) {
        throw new ErrorWithStatus('Rạp chiếu không tồn tại', 404);
    }

    const groupedShowtimes = theater.showtimes.reduce((acc, showtime) => {
        const movieId = showtime.movieId; // Chuyển đổi ObjectId thành chuỗi để sử dụng như key trong object
        if (!acc[movieId]) {
            acc[movieId] = [];
        }
        acc[movieId].push(showtime);
        return acc;
    }, {});

    const showtimesByMovie = Object.entries(groupedShowtimes).map(async ([movieId, showtimes]) => {
        const movie = await getMovieDetails(movieId);
        return { movie, showtimes };
    });

    const result = await Promise.all(showtimesByMovie);

    session.endSession();
    res.status(201).json({ data: result });
});

const getShowtime = asyncHandler(async (req, res) => {
    const session = req.session;
    const showtime = await Showtime.findById(req.params.id);

    showtime.movie = await getMovieDetails(showtime.movieId);

    session.endSession();
    res.status(201).json({ data: showtime });
});

module.exports = {
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtime,
};
