const { Router } = require('express');
const { createFood, updateFood, deleteFood, getFoods, getFoodsByTheater } = require('../controllers/food.controller');
const { isCinema } = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

const router = Router();

router.post('/', isCinema, upload.single('image'), createFood);
router.put('/:id', isCinema, upload.single('image'), updateFood);
router.delete('/:id', isCinema, deleteFood);
router.get('/:theaterId', getFoodsByTheater);
router.get('/', isCinema, getFoods);

module.exports = router;
