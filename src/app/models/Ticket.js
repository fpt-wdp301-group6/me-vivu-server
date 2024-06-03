const { Schema, model } = require('mongoose');

const Ticket = new Schema(
    {
        showtime: {
            type: Schema.Types.ObjectId,
            ref: 'Showtime',
            required: true,
        },
        foods: [
            {
                item: {
                    type: Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        seats: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Seat',
                required: true,
            },
        ],
    },
    { timestamps: true },
);

module.exports = model('Ticket', Ticket);
