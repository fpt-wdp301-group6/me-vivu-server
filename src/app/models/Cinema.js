const { Schema, model } = require('mongoose');
const slug = require('mongoose-slug-updater');
const softDelete = require('mongoose-delete');

const Cinema = new Schema(
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
        logo: {
            type: String,
        },
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

Cinema.plugin(slug);
Cinema.plugin(softDelete, { overrideMethods: true, deletedAt: true, deletedBy: true });

module.exports = model('Cinema', Cinema);
