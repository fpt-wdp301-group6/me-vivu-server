const { Router } = require('express');
const { login, register, refreshToken, logout, loginByRefreshToken } = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/logout', logout);
router.post('/login-refresh', loginByRefreshToken);

module.exports = router;
