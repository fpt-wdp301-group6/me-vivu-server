const { Router } = require('express');
const {
    createTheater,
    updateTheater,
    deleteTheater,
    restoreTheater,
    getTheater,
    getTheaters,
    getTheatersAll,
    getTheaterWithDeleted,
} = require('../controllers/theater.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isCinema, createTheater);
router.put('/:id', isCinema, updateTheater);
router.delete('/:id', isCinema, deleteTheater);
router.patch('/:id/restore', isCinema, restoreTheater);
router.get('/all/:id', isCinema, getTheaterWithDeleted);
router.get('/all', isCinema, getTheatersAll);
router.get('/:slug', getTheater);
router.get('/', getTheaters);

module.exports = router;
