const asyncHandler = require('express-async-handler');
const { City, District, Ward } = require('../models/Address.js');
const APIFeatures = require('../../utils/APIFeatures.js');

const getCities = asyncHandler(async (req, res) => {
    const features = new APIFeatures(City, req.query).filter().sort().limitFields();
    const cities = await features.query;
    req.session.endSession();
    res.status(200).json(cities);
});

const getDistricts = asyncHandler(async (req, res) => {
    const features = new APIFeatures(District, req.query).filter().sort().limitFields();
    const districts = await features.query;
    req.session.endSession();
    res.status(200).json(districts);
});

const getWards = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Ward, req.query).filter().sort().limitFields();
    const wards = await features.query;
    req.session.endSession();
    res.status(200).json(wards);
});

module.exports = { getCities, getDistricts, getWards };
