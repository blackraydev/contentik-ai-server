const cron = require('node-cron');
const tariffService = require('../services/tariff-service');

const scheduleTariffSubscriptionCheckoutCron = () => {
  cron.schedule('0 */12 * * *', async () => {
    console.log('Проверка подписок...');
    await tariffService.checkoutSubscriptionTariff();
  });
};

module.exports = {
  scheduleTariffSubscriptionCheckoutCron,
};
