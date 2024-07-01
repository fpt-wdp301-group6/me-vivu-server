const asyncHandler = require('express-async-handler');
const Theater = require('../models/Theater');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const { ErrorWithStatus } = require('../../utils/error');

const createRoom = asyncHandler(async (req, res) => {
    const session = req.session;
    const { name, theaterId } = req.body;
    const theater = await Theater.findOne({ _id: theaterId, cinema: req.user.cinema }).select('rooms').session(session);

    if (!theater) {
        throw new ErrorWithStatus('Rạp chiếu không tồn tại', 404);
    }

    if (theater.rooms.some((room) => room.name === name)) {
        throw new ErrorWithStatus('Tên phòng đã tồn tại', 409);
    }

    const room = new Room(req.body);
    theater.rooms.push(room);
    await Promise.all([theater.save({ session }), room.save({ session })]);

    await session.commitTransaction();
    session.endSession();
    res.json({ data: room, message: 'Phòng chiếu được tạo thành công' });
});

const updateRoom = asyncHandler(async (req, res) => {
    const session = req.session;
    const room = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, session });
    if (!room) {
        throw new ErrorWithStatus('Phòng chiếu không tồn tại', 404);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: room, message: 'Phòng chiếu được cập nhật thành công' });
});

const deleteRoom = asyncHandler(async (req, res) => {
    const session = req.session;
    const roomId = req.params.id;
    const food = await Room.findById(roomId).session(session);
    if (!food) {
        throw new ErrorWithStatus('Phóng chiếu không tồn tại', 404);
    }

    await Promise.all([
        food.deleteOne({ session }),
        Theater.updateMany({ rooms: roomId }, { $pull: { rooms: roomId } }, { session }),
    ]);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ data: food, message: 'Phóng chiếu được xóa thành công' });
});

const getRooms = asyncHandler(async (req, res) => {
    const session = req.session;
    const theater = await Theater.findOne({ _id: req.params.theaterId, cinema: req.user.cinema })
        .select('rooms')
        .populate('rooms');

    if (!theater) {
        throw new ErrorWithStatus('Rạp chiếu không tồn tại', 404);
    }

    session.endSession();
    res.status(201).json({ data: theater.rooms });
});

const getSeats = asyncHandler(async (req, res) => {
    const session = req.session;
    const room = await Room.findById(req.params.id).select('seats').populate('seats');
    if (!room) {
        throw new ErrorWithStatus('Phòng chiếu không tồn tại', 404);
    }

    session.endSession();
    res.status(201).json({ data: room.seats });
});

const changeSeatMap = asyncHandler(async (req, res) => {
    const session = req.session;
    const room = await Room.findById(req.params.id).select('seats').session(session);
    if (!room) {
        throw new ErrorWithStatus('Phòng chiếu không tồn tại', 404);
    }

    const seatOperations = req.body.seats;
    const bulkOperations = [];
    seatOperations.forEach((seat, index) => {
        if (!seat.name) {
            throw new ErrorWithStatus('Vui lòng nhập số ghế', 400);
        }
        const isDuplicatedName = seatOperations.slice(index + 1).some((item) => item.name === seat.name);
        if (isDuplicatedName) {
            throw new ErrorWithStatus('Số ghế trùng nhau', 409);
        }
        const isDuplicatedCoordinates = seatOperations
            .slice(index + 1)
            .some((item) => item.x === seat.x && item.y === seat.y);
        if (isDuplicatedCoordinates) {
            throw new ErrorWithStatus('Vị trí ghế trùng nhau', 409);
        }

        if (seat._id) {
            bulkOperations.push({
                updateOne: {
                    filter: { _id: seat._id },
                    update: { $set: seat },
                },
            });
        } else {
            bulkOperations.push({
                insertOne: {
                    document: seat,
                },
            });
        }
    });

    room.seats
        .filter((seatId) => !seatOperations.some((seat) => seatId.equals(seat._id)))
        .forEach((seat) => {
            bulkOperations.push({
                deleteOne: {
                    filter: { _id: seat._id },
                },
            });
        });

    const result = await Seat.bulkWrite(bulkOperations, { session });

    const newSeats = result.insertedIds ? Object.values(result.insertedIds) : [];
    room.seats = room.seats.filter((seatId) => seatOperations.some((seat) => seatId.equals(seat._id)));
    room.seats = room.seats.concat(newSeats);
    await room.save();

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Bản đồ ghế được cập nhật thành công' });
});

module.exports = {
    createRoom,
    updateRoom,
    deleteRoom,
    getRooms,
    getSeats,
    changeSeatMap,
};
