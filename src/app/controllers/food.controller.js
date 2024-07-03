const asyncHandler = require('express-async-handler');
const Cinema = require('../models/Cinema');
const Theater = require('../models/Theater');
const Food = require('../models/Food');
const { ErrorWithStatus } = require('../../utils/error');
const { uploadToCloudinary } = require('../../utils/cloudinaryUploader');

const createFood = asyncHandler(async (req, res) => {
    const session = req.session;
    const { name } = req.body;
    const cinema = await Cinema.findById(req.user.cinema).select('foods').populate('foods').session(session);

    if (cinema.foods.some((food) => food.name === name)) {
        throw new ErrorWithStatus('Tên combo đã tồn tại', 409);
    }

    const imagePath = req.file?.path;
    const image = await uploadToCloudinary(imagePath);

    const food = new Food({ ...req.body, image: image.secure_url });
    cinema.foods.push(food);
    await Promise.all([cinema.save({ session }), food.save({ session })]);

    await session.commitTransaction();
    session.endSession();
    res.json({ data: food, message: 'Combo bắp nước được tạo thành công' });
});

const updateFood = asyncHandler(async (req, res) => {
    const session = req.session;
    const imagePath = req.file?.path;
    if (imagePath) {
        const image = await uploadToCloudinary(imagePath);
        req.body.image = image.secure_url;
    }
    const food = await Food.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, session });
    if (!food) {
        throw new ErrorWithStatus('Combo không tồn tại', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: food, message: 'Combo được cập nhật thành công' });
});

const deleteFood = asyncHandler(async (req, res) => {
    const session = req.session;
    const foodId = req.params.id;
    const food = await Food.findById(foodId).session(session);
    if (!food) {
        throw new ErrorWithStatus('Combo không tồn tại', 404);
    }

    await Promise.all([
        food.deleteOne({ session }),
        Cinema.updateMany({ foods: foodId }, { $pull: { foods: foodId } }, { session }),
        Theater.updateMany({ foods: foodId }, { $pull: { foods: foodId } }, { session }),
    ]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: food, message: 'Combo được xóa thành công' });
});

const getFoods = asyncHandler(async (req, res) => {
    const session = req.session;
    const cinema = await Cinema.findById(req.user.cinema).select('foods').populate('foods');

    if (!cinema) {
        throw new ErrorWithStatus('Hệ thống rạp chiếu không tồn tại', 404);
    }

    session.endSession();
    res.status(201).json({ data: cinema.foods });
});

const getFoodsByTheater = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findById(req.params.theaterId).select('foods').populate('foods');

    if (!theater) {
        throw new ErrorWithStatus('Rạp chiếu không tồn tại', 404);
    }

    session.endSession();
    res.status(201).json({ data: theater.foods });
});

module.exports = {
    createFood,
    updateFood,
    deleteFood,
    getFoods,
    getFoodsByTheater,
};
