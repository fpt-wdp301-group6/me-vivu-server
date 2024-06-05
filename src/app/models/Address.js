const { Schema, model } = require('mongoose');

const CitySchema = new Schema({
    name: String,
    slug: String,
    type: String,
    name_with_type: String,
    code: String,
});

const DistrictSchema = new Schema({
    name: String,
    slug: String,
    type: String,
    name_with_type: String,
    path: String,
    path_with_type: String,
    code: String,
    parent_code: String,
});

const WardSchema = new Schema({
    name: String,
    slug: String,
    type: String,
    name_with_type: String,
    path: String,
    path_with_type: String,
    code: String,
    parent_code: String,
});

const City = model('City', CitySchema);
const District = model('District', DistrictSchema);
const Ward = model('Ward', WardSchema);

module.exports = { City, District, Ward };
