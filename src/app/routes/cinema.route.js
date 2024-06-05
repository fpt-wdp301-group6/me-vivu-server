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
const { isAdmin } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isAdmin, createCinema);
router.put('/:id', isAdmin, updateCinema);
router.delete('/:id', isAdmin, deleteCinema);
router.patch('/:id/restore', isAdmin, restoreCinema);
router.get('/all/:id', isAdmin, getCinemaWithDeleted);
router.get('/all', isAdmin, getCinemasAll);
router.get('/:slug', getCinema);
router.get('/', getCinemas);

module.exports = router;
