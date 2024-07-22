require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./models');
const router = require('./router');
const errorMiddleware = require('./middlewares/error-middleware');
const { scheduleTariffSubscriptionCheckoutCron } = require('./crons/tariff-cron');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const corsWhiteList = [
    'https://contentik-ai.ru',
    'https://blackraydev.github.io',
    'https://localhost',
    'https://localhost:5173',
    'http://localhost:5173',
  ];

  if (corsWhiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
  }

  next();
});
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await sequelize.authenticate();
    app.listen(port, () => console.log(`Server running on port ${port}`));
    scheduleTariffSubscriptionCheckoutCron();
  } catch (e) {
    console.log(e);
  }
};

start();
