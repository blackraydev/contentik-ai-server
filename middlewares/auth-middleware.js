const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');
const axios = require('axios');
const userService = require('../services/user-service');

const authMiddleware = async function (req, _, next) {
  try {
    console.log('\n\n\n')
    const authorizationHeader = req.headers.authorization;
    console.log(authorizationHeader)
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(' ')[1];

    console.log(accessToken)

    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const isVKToken = accessToken?.slice(0, 2) === 'vk';
    const isYandexToken = accessToken?.slice(0, 1) === 'y';

    let userData = null;

    if (isVKToken) {
      const {
        data: {
          user: { user_id: vkUserId },
        },
      } = await axios.post(
        'https://id.vk.com/oauth2/user_info',
        {
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
          access_token: accessToken,
        },
        {
          params: {
            client_id: process.env.VK_CLIENT_ID,
            client_secret: process.env.VK_CLIENT_SECRET,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      userData = await userService.getVKUser(vkUserId);
    } else if (isYandexToken) {
      const {
        data: { id: yandexUserId },
      } = await axios.get('https://login.yandex.ru/info', {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
      });

      userData = await userService.getYandexUser(yandexUserId);
    } else {
      userData = tokenService.validateAccessToken(accessToken);
      console.log(accessToken, userData)
    }

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    console.log(e)
    return next(ApiError.UnauthorizedError());
  }
};

module.exports = authMiddleware;
