const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const { connect } = require('./config/db');
const cookieParser = require('cookie-parser');

const { error } = require('./app/middlewares/error');
const routes = require('./app/routes');

dotenv.config({ path: '.env.local' });
connect();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(
    cors({
        origin: [process.env.WEBSITE, /^http:\/\/localhost(:\d+)?$/],
        credentials: true,
    }),
);
app.use(cookieParser(process.env.COOKIES_KEY));

routes(app);

app.use(error);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
