const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserRole } = require('../../utils/constants');
const { ErrorWithStatus } = require('../../utils/error');

const User = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otpVerify: {
            otp: {
                type: String,
            },
            createdAt: {
                type: Date,
            },
            expiredAt: {
                type: Date,
            },
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.User,
        },
        providerId: String,
        avatar: {
            type: String,
        },
        phone: {
            type: String,
        },
        refreshToken: String,
        tickets: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Ticket',
                required: true,
            },
        ],
        linkedCinema: {
            type: Schema.Types.ObjectId,
            ref: 'Cinema',
        },
    },
    { timestamps: true },
);

User.pre('save', async function () {
    if (this.role === UserRole.Cinema && !this.linkedCinema) {
        throw new ErrorWithStatus('Không có hệ thống rạp liên kết');
    }
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

User.pre('findOneAndUpdate', async function (next) {
    const password = this.getUpdate().$set.password;
    const role = this.getUpdate().$set.role;
    const linkedCinema = this.getUpdate().$set.linkedCinema;
    if (!password && !role && linkedCinema) {
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.getUpdate().$set.password = await bcrypt.hash(password, salt);
    if (role === UserRole.Cinema && !linkedCinema) {
        throw new ErrorWithStatus('Không có hệ thống rạp liên kết');
    }
});

User.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Phương pháp toJSON để tự động loại bỏ các trường nhạy cảm
User.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.role;
    delete obj.otpVerify;
    delete obj.isVerified;
    delete obj.refreshToken;
    return obj;
};

User.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, role: this.role, cinema: this.linkedCinema }, process.env.ACCESS_TOKEN, {
        expiresIn: '10m',
    });
};

User.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id, role: this.role, cinema: this.linkedCinema }, process.env.REFRESH_TOKEN, {
        expiresIn: '30d',
    });
};

module.exports = model('User', User);
