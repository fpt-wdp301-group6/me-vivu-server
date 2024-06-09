const { Router } = require('express');
const { createFood, updateFood, deleteFood, getFoods, getFoodsByTheater } = require('../controllers/food.controller');
const { isCinema } = require('../middlewares/authenticate');

const router = Router();

router.post('/', isCinema, createFood);
router.put('/:id', isCinema, updateFood);
router.delete('/:id', isCinema, deleteFood);
router.get('/:theaterId', getFoodsByTheater);
router.get('/', isCinema, getFoods);

module.exports = router;
