const { Schema, model } = require('mongoose');
const { ErrorWithStatus } = require('../../utils/error');

const Showtime = new Schema(
    {
        room: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        movieId: {
            type: Number,
            required: true,
        },
        reservedSeats: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Seat',
                required: true,
            },
        ],
        startAt: {
            type: Date,
            required: true,
        },
        endAt: {
            type: Date,
            required: true,
        },
        price: {
            normal: {
                type: Number,
                default: 0,
                required: true,
            },
            vip: {
                type: Number,
                default: 0,
            },
            couple: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true },
);

Showtime.index({ startAt: 1 });

Showtime.pre('save', async function (next) {
    const showtime = this;

    const overlappingShowtime = await model('Showtime').findOne({
        room: showtime.room,
        _id: { $ne: showtime._id },
        $or: [
            { startAt: { $lt: showtime.endAt, $gt: showtime.startAt } },
            { endAt: { $lt: showtime.endAt, $gt: showtime.startAt } },
            { startAt: { $lte: showtime.startAt }, endAt: { $gte: showtime.endAt } },
        ],
    });

    if (overlappingShowtime) {
        throw new ErrorWithStatus('Lịch chiếu bị chồng chéo', 409);
    }

    next();
});

module.exports = model('Showtime', Showtime);
