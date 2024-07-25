require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./models');
const router = require('./router');
const errorMiddleware = require('./middlewares/error-middleware');
const { scheduleTariffSubscriptionCheckoutCron } = require('./crons/tariff-cron');

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 4443;
const app = express();

const privateKey = fs.readFileSync('/etc/ssl/contentik/contentik.key', 'utf8');
const certificate = fs.readFileSync('/etc/ssl/contentik/contentik.crt', 'utf8');
const ca = fs.readFileSync('/etc/ssl/contentik/ca.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const corsWhiteList = [
    'https://contentik-ai.ru',
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
app.set('trust proxy', true);
app.use('/api', router);
app.use(errorMiddleware);

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server running on port ${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, async () => {
  await sequelize.authenticate();
  scheduleTariffSubscriptionCheckoutCron();
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});
