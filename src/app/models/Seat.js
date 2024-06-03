const { Schema, model } = require('mongoose');

const SeatTypeEnum = {
    Normal: 'normal',
    VIP: 'vip',
    Couple: 'couple',
};

const Seat = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: [SeatTypeEnum.Normal, SeatTypeEnum.VIP, SeatTypeEnum.Couple],
            default: SeatTypeEnum.Normal,
        },
    },
    { timestamps: true },
);

module.exports = model('Seat', Seat);
