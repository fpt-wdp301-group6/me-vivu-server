const { Schema, model } = require('mongoose');

const TicketStatusEnum = {
    Pending: 1,
    Paid: 2,
    Cancelled: 3,
    Returned: 4,
};

const Ticket = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        showtime: {
            type: Schema.Types.ObjectId,
            ref: 'Showtime',
            required: true,
        },
        theater: {
            type: Schema.Types.ObjectId,
            ref: 'Theater',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(TicketStatusEnum),
            default: TicketStatusEnum.Pending,
        },
        code: {
            type: Number,
            unique: true,
            default: Date.now(),
        },
        paymentLinkId: {
            type: String,
            unique: true,
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
