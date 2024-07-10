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
    const endAt = new Date(startAt);
    endAt.setMinutes(endAt.getMinutes() + movie.runtime);
    req.body.endAt = endAt;

    const showtime = new Showtime(req.body);
    theater.showtimes.push(showtime);
    await Promise.all([showtime.save({ session }), theater.save({ session })]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: showtime, message: 'Lịch chiếu được tạo thành công' });
});

const updateShowtime = asyncHandler(async (req, res) => {
    const session = req.session;
    const {
        movieId,
        startAt,
        price: { normal, vip, couple },
    } = req.body;

    const showtime = await Showtime.findById(req.params.id).session(session);

    if (!showtime) {
        throw new ErrorWithStatus('Lịch chiếu chưa được tạo', 404);
    }

    if (Number(movieId) !== showtime.movieId || showtime.startAt.getTime() !== new Date(startAt).getTime()) {
        const movie = await getMovieDetails(movieId);
        if (!movie) {
            throw new ErrorWithStatus('Phim không tìm thấy', 404);
        }

        const endAt = new Date(startAt);
        endAt.setMinutes(endAt.getMinutes() + movie.runtime);
        showtime.movieId = movieId;
        showtime.startAt = startAt;
        showtime.endAt = endAt;
    }

    //TODO: Optimize later
    showtime.price.normal = normal;
    showtime.price.vip = vip;
    showtime.price.couple = couple;

    await showtime.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: showtime, message: 'Lịch chiếu được cập nhật thành công' });
});

const deleteShowtime = asyncHandler(async (req, res) => {
    const session = req.session;
    const showtime = await Showtime.findOne({ _id: req.params.id }).session(session);
    if (!showtime) {
        throw new ErrorWithStatus('Lịch chiếu chưa được tạo', 404);
    }

    await Showtime.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: showtime, message: 'Lịch chiếu được xóa thành công' });
});

const getShowtimesByTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const { date } = req.query;
    const { theaterId } = req.params;

    const start = new Date(date || '');
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);
    end.setDate(end.getDate() + 1);

    const theater = await Theater.findById(theaterId)
        .populate({
            path: 'showtimes',
            match: {
                startAt: { $gte: start, $lte: end },
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

    Object.keys(groupedShowtimes).forEach((movieId) => {
        groupedShowtimes[movieId].sort((a, b) => {
            const timeA = new Date(a.startAt).getTime();
            const timeB = new Date(b.startAt).getTime();
            return timeA - timeB;
        });
    });

    const showtimesByMovie = Object.entries(groupedShowtimes).map(async ([movieId, showtimes]) => {
        const movie = await getMovieDetails(movieId);
        return { movie, showtimes };
    });

    const result = await Promise.all(showtimesByMovie);

    session.endSession();
    res.status(201).json({ data: result });
});

const getShowtimesByRoom = asyncHandler(async (req, res) => {
    const session = req.session;
    const { date } = req.query;
    const { roomId } = req.params;
    const start = new Date(date || '');
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);
    end.setDate(end.getDate() + 1);
    const showtimesOfRoom = await Showtime.find({
        room: roomId,
    });

    const movies = [];
    const showtimesWithMovieDetails = await Promise.all(
        showtimesOfRoom.map(async (showtime) => {
            let movie = movies.find((item) => (item.id = showtime.movieId));
            if (!movie) {
                movie = await getMovieDetails(showtime.movieId);
                movies.push(movie);
            }

            return {
                ...showtime.toObject(),
                movie: movie,
            };
        }),
    );

    session.endSession();
    res.status(201).json({ data: showtimesWithMovieDetails });
});

const getShowtime = asyncHandler(async (req, res) => {
    const session = req.session;
    const showtime = await Showtime.findById(req.params.id);

    showtime.movie = await getMovieDetails(showtime.movieId);

    session.endSession();
    res.status(201).json({ data: showtime });
});

const getSeatsByShowtime = asyncHandler(async (req, res) => {
    const session = req.session;

    const showtime = await Showtime.findById(req.params.id).populate({
        path: 'room',
        populate: {
            path: 'seats',
        },
    });

    const seats = showtime.room.seats;

    seats.map((seat) => {
        if (showtime.reservedSeats.includes(seat._id)) {
            seat.status = 'reserved';
        }
    });

    session.endSession();
    res.status(201).json({ data: seats });
});

module.exports = {
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtime,
    getSeatsByShowtime,
    getShowtimesByRoom,
};
