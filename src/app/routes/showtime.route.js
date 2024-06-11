const { Router } = require('express');
const {
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByTheater,
    getShowtime,
} = require('../controllers/showtime.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isCinema, createShowtime);
router.put('/:id', isCinema, updateShowtime);
router.delete('/:id', isCinema, deleteShowtime);
router.get('/:theaterId/list', getShowtimesByTheater);
router.get('/:id', getShowtime);

module.exports = router;
