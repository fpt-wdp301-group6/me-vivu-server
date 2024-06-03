const { Schema, model } = require('mongoose');
const slug = require('mongoose-slug-updater');

const Theater = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        rooms: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Room',
                required: true,
            },
        ],
        foods: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Food',
                required: true,
            },
        ],
    },
    { timestamps: true },
);

Theater.plugin(slug);

module.exports = model('Theater', Theater);
