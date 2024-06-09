const { Schema, model } = require('mongoose');

const SeatTypeEnum = {
    Normal: 'normal',
    VIP: 'vip',
    Couple: 'couple',
};

const SeatStatusEnum = {
    Available: 'available',
    Reserved: 'reserved',
    Broke: 'broke',
};

const Seat = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(SeatTypeEnum),
            default: SeatTypeEnum.Normal,
        },
        status: {
            type: String,
            enum: Object.values(SeatStatusEnum),
            default: SeatStatusEnum.Available,
        },
    },
    { timestamps: true },
);

module.exports = model('Seat', Seat);
