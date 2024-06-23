const multer = require('multer');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, `${new Date().getMilliseconds()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

module.exports = upload;
