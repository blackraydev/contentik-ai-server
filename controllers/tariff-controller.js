const tariffService = require('../services/tariff-service');

const whiteList = ['77.75.153.78', '77.75.154.206'];

const getIpAddress = (req) => {
  return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

class TariffController {
  async getTariff(req, res, next) {
    try {
      const { id: userId } = req.user;
      const tariff = await tariffService.getTariff(userId);

      return res.json(tariff);
    } catch (e) {
      next(e);
    }
  }

  async checkoutTariff(req, res, next) {
    try {
      const { newPlan } = req.body;
      const { id: userId } = req.user;
      const confirmationToken = await tariffService.checkoutTariff(userId, newPlan);

      return res.json(confirmationToken);
    } catch (e) {
      next(e);
    }
  }

  async tariffWebhook(req, res, next) {
    try {
      const { event, object } = req.body;
      const {
        metadata: { userId, newPlan },
        payment_method: { id: paymentMethodId, saved: isPaymentMethodSaved },
      } = object;

      const ip = getIpAddress(req);
      const isWhiteListedIp = whiteList.includes(ip);
      const isHasPayload = userId && newPlan;
      const isPaymentSucceeded = event === 'payment.succeeded';

      console.log(ip);

      if (isWhiteListedIp && isPaymentSucceeded && isHasPayload) {
        await tariffService.purchaseTariff(
          userId,
          newPlan,
          isPaymentMethodSaved ? paymentMethodId : null,
        );
      }

      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }

  async declineSubscriptionTariff(req, res, next) {
    try {
      const { id: userId } = req.user;
      const tariff = await tariffService.declineSubscriptionTariff(userId);
      return res.json(tariff);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new TariffController();
