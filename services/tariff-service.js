const axios = require('axios');
const uuid = require('uuid');
const { Op } = require('sequelize');
const { Tariff } = require('../models');
const TariffDTO = require('../dtos/tariff-dto');
const ApiError = require('../exceptions/api-error');

const getTariffDetails = (plan, isSubscription = false) => {
  const prefix = isSubscription ? 'Продление тарифа' : 'Покупка тарифа';

  if (plan === 'start') {
    return {
      value: '399.00',
      description: `${prefix}: Стартовый`,
    };
  }
  if (plan === 'pro') {
    return {
      value: '799.00',
      description: `${prefix}: Про`,
    };
  }
  if (plan === 'expert') {
    return {
      value: '1599.00',
      description: `${prefix}: Эксперт`,
    };
  }
};

class TariffService {
  async getTariff(userId) {
    const date = new Date();
    const nextMonthDate = new Date(date.setMonth(date.getMonth() + 1));

    const [tariff] = await Tariff.findOrCreate({
      where: { userId },
      defaults: {
        plan: 'trial',
        userId,
        creations: 3,
        edits: 1,
        startAt: new Date(),
        endAt: nextMonthDate,
      },
    });

    const tariffDto = new TariffDTO(tariff);
    return tariffDto;
  }

  async purchaseTariff(userId, newPlan, paymentMethodId) {
    const tariff = await Tariff.findOne({ where: { userId } });

    const date = new Date();
    const nextMonthDate = new Date(date.setMonth(date.getMonth() + 1));

    if (newPlan === 'start') {
      tariff.creations = 50;
      tariff.edits = 25;
    } else if (newPlan === 'pro') {
      tariff.creations = 150;
      tariff.edits = 75;
    } else if (newPlan === 'expert') {
      tariff.creations = 500;
      tariff.edits = 250;
    }

    tariff.plan = newPlan;
    tariff.startAt = new Date();
    tariff.endAt = nextMonthDate;
    tariff.paymentMethodId = paymentMethodId;
    tariff.isExpired = false;

    await tariff.save();

    const tariffDto = new TariffDTO(tariff);
    return tariffDto;
  }

  async useTariff(userId, mode) {
    const tariff = await Tariff.findOne({ where: { userId } });

    if (mode === 'create') {
      if (tariff.creations <= 0) {
        throw ApiError.PaymentRequired('Лимит созданий исчерпан');
      }

      tariff.creations -= 1;
    } else {
      if (tariff.edits <= 0) {
        throw ApiError.PaymentRequired('Лимит редактирований исчерпан');
      }

      tariff.edits -= 1;
    }

    tariff.save();
    return tariff;
  }

  async checkoutTariff(userId, newPlan) {
    const { value, description } = getTariffDetails(newPlan);

    const {
      data: {
        confirmation: { confirmation_token: confirmationToken },
      },
    } = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      {
        amount: {
          value,
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        merchant_customer_id: userId,
        capture: true,
        save_payment_method: true,
        description,
        metadata: {
          userId,
          newPlan,
        },
      },
      {
        auth: {
          username: process.env.YOOMONEY_SHOP_ID,
          password: process.env.YOOMONEY_SECRET_KEY,
        },
        headers: {
          'Idempotence-Key': uuid.v4(),
          'Content-Type': 'application/json',
        },
      },
    );

    return confirmationToken;
  }

  async checkoutSubscriptionTariff() {
    try {
      const tariffs = await Tariff.findAll({
        where: {
          plan: {
            [Op.not]: 'trial',
          },
          endAt: {
            [Op.lt]: new Date(),
          },
        },
      });

      for (let i = 0; i < tariffs.length; i++) {
        const tariff = tariffs[i];
        const { value, description } = getTariffDetails(tariff.plan, true);

        // Если отключено автопродление = подписка просрочена и ограничена
        if (!tariff.paymentMethodId && !tariff.isExpired) {
          tariff.isExpired = true;

          console.log('Subscription cancelled');

          await tariff.save();
        } else if (tariff.paymentMethodId) {
          const {
            data: {
              payment_method: { id: paymentMethodId },
              status,
            },
          } = await axios.post(
            'https://api.yookassa.ru/v3/payments',
            {
              amount: {
                value,
                currency: 'RUB',
              },
              capture: true,
              payment_method_id: tariff.paymentMethodId,
              description,
              metadata: {
                userId: tariff.userId,
                newPlan: tariff.plan,
              },
            },
            {
              auth: {
                username: process.env.YOOMONEY_SHOP_ID,
                password: process.env.YOOMONEY_SECRET_KEY,
              },
              headers: {
                'Idempotence-Key': uuid.v4(),
                'Content-Type': 'application/json',
              },
            },
          );
          console.log(status);
          if (status === 'succeeded') {
            console.log('Subscription payed manually');
            await this.purchaseTariff(tariff.userId, tariff.plan, paymentMethodId);
          } else {
            tariff.paymentMethodId = null;
            tariff.isExpired = true;

            console.log('Subscription cancelled');

            await tariff.save();
          }
        }
      }

      return;
    } catch (e) {
      console.log(e);
    }
  }

  async declineSubscriptionTariff(userId) {
    const tariff = await Tariff.findOne({ where: { userId } });
    tariff.paymentMethodId = null;
    return await tariff.save();
  }
}

module.exports = new TariffService();
