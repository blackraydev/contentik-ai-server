const tariffService = require('../services/tariff-service');

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

  // Добавить проверку на IP-адрес, чтобы убедиться, что запрос прислала ЮКасса, а не пользователь
  async tariffWebhook(req, res, next) {
    try {
      const { event, object } = req.body;
      const {
        metadata: { userId, newPlan },
        payment_method: { id: paymentMethodId, saved: isPaymentMethodSaved },
      } = object;

      console.log(req);

      if (event === 'payment.succeeded') {
        console.log(req.body);
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
      await tariffService.declineSubscriptionTariff(userId);
      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new TariffController();
