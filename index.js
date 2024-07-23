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

const app = express();

const privateKey = fs.readFileSync('/etc/ssl/domainssl/contentik-ai.ru/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/ssl/domainssl/contentik-ai.ru/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/ssl/domainssl/contentik-ai.ru/chain.pem', 'utf8');

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

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, async () => {
  await sequelize.authenticate();
  scheduleTariffSubscriptionCheckoutCron();
  console.log('HTTPS Server running on port 443');
});
