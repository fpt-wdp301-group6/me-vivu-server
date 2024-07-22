const { Router } = require('express');
const {
    login,
    register,
    refreshToken,
    logout,
    loginByRefreshToken,
    loginByOthers,
    changePassword,
} = require('../controllers/auth.controller');
const { isUser } = require('../middlewares/authenticate');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/others', loginByOthers);
router.post('/refresh-token', refreshToken);
router.get('/logout', logout);
router.post('/login-refresh', loginByRefreshToken);
router.patch('/me/change-password', isUser, changePassword);

module.exports = router;
