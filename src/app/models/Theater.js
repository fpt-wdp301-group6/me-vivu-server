const { Schema, model } = require('mongoose');
const slug = require('mongoose-slug-updater');
const softDelete = require('mongoose-delete');
const { getAddressDetails } = require('./Address');

const Theater = new Schema(
    {
        cinema: {
            type: Schema.Types.ObjectId,
            ref: 'Cinema',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        address: {
            type: {
                city: {
                    type: String,
                    required: true,
                },
                district: {
                    type: String,
                    required: true,
                },
                ward: {
                    type: String,
                },
                street: {
                    type: String,
                    required: true,
                },
                detail: {
                    type: String,
                },
            },
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
Theater.plugin(softDelete, { overrideMethods: true, deletedAt: true, deletedBy: true });

Theater.pre('save', async function () {
    if (this.isModified('address')) {
        const { city, district, ward } = this.address;
        this.address.detail = this.address.street + ', ' + (await getAddressDetails(city, district, ward));
    }
});

Theater.pre('findOneAndUpdate', async function (next) {
    const address = this.getUpdate().$set.address;
    if (!address) {
        return next();
    }
    const { city, district, ward } = address;
    address.detail = address.street + ', ' + (await getAddressDetails(city, district, ward));
});

module.exports = model('Theater', Theater);
