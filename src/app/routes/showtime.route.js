const { Router } = require('express');
const {
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtime,
    getSeatsByShowtime,
} = require('../controllers/showtime.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isCinema, createShowtime);
router.put('/:id', isCinema, updateShowtime);
router.delete('/:id', isCinema, deleteShowtime);
router.get('/:theaterId/list', getShowtimesByTheater);
router.get('/:id', getShowtime);
router.get('/:id/seats', getSeatsByShowtime);

module.exports = router;
