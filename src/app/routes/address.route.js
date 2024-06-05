const { Router } = require('express');
const { getCities, getDistricts, getWards } = require('../controllers/address.controller');

const router = Router();

router.get('/cities', getCities);
router.get('/districts', getDistricts);
router.get('/wards', getWards);

module.exports = router;
