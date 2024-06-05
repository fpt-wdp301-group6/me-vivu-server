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

const router = Router();

router.post('/', createTheater);
router.put('/:id', updateTheater);
router.delete('/:id', deleteTheater);
router.patch('/:id/restore', restoreTheater);
router.get('/all/:id', getTheaterWithDeleted);
router.get('/all', getTheatersAll);
router.get('/:slug', getTheater);
router.get('/', getTheaters);

module.exports = router;
