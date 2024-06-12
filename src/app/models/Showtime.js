const { Schema, model } = require('mongoose');

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
    },
    { timestamps: true },
);

Showtime.index({ startAt: 1 });

module.exports = model('Showtime', Showtime);
