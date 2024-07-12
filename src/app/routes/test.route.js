const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.json('Server đang hoạt động!');
});

module.exports = router;
