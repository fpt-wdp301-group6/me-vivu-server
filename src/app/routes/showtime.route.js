const { Router } = require('express');
const {
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtime,
    getSeatsByShowtime,
    getShowtimesByRoom,
    countByCinema,
    countAll,
} = require('../controllers/showtime.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isCinema, createShowtime);
router.put('/:id', isCinema, updateShowtime);
router.delete('/:id', isCinema, deleteShowtime);
router.get('/:theaterId/list', getShowtimesByTheater);
router.get('/:roomId/listbyroom', isCinema, getShowtimesByRoom);
router.get('/:id', getShowtime);
router.get('/:id/seats', getSeatsByShowtime);
router.get('/cinema/count', isCinema, countByCinema);
router.get('/all/count', countAll);

module.exports = router;
