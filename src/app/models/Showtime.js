const { Schema, model } = require('mongoose');

const Showtime = new Schema(
    {
        room: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        movie: {
            type: Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
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

module.exports = model('Showtime', Showtime);
