const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/movie',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
});

api.interceptors.request.use(
    (config) => {
        if (!config.params) {
            config.params = {};
        }
        config.params.language = 'vi-VN';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use((res) => {
    return res.data;
});

async function getMovieDetails(movieId) {
    return api.get(`/${movieId}`);
}

module.exports = getMovieDetails;
