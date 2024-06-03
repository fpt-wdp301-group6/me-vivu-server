const { Router } = require('express');
const {
    createCinema,
    updateCinema,
    deleteCinema,
    restoreCinema,
    getCinema,
    getCinemas,
    getCinemasAll,
    getCinemaWithDeleted,
} = require('../controllers/cinema.controller');

const router = Router();

router.post('/', createCinema);
router.put('/:id', updateCinema);
router.delete('/:id', deleteCinema);
router.patch('/:id/restore', restoreCinema);
router.get('/all/:id', getCinemaWithDeleted);
router.get('/all', getCinemasAll);
router.get('/:slug', getCinema);
router.get('/', getCinemas);

module.exports = router;
