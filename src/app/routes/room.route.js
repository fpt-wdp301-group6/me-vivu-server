const { Router } = require('express');
const {
    createRoom,
    updateRoom,
    deleteRoom,
    getRooms,
    getSeats,
    changeSeatMap,
} = require('../controllers/room.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/:theaterId', isCinema, createRoom);
router.put('/:id', isCinema, updateRoom);
router.patch('/:id/seats', isCinema, changeSeatMap);
router.delete('/:id', isCinema, deleteRoom);
router.get('/:theaterId', isCinema, getRooms);
router.get('/:id/seats', getSeats);

module.exports = router;
