const { Schema, model } = require('mongoose');

const Room = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        seats: [
            [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'seat',
                },
            ],
        ],
    },
    { timestamps: true },
);

module.exports = model('Room', Room);
