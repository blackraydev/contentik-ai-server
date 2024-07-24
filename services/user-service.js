const { User } = require('../models');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const axios = require('axios');

class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    const user = await User.create({ email, password: hashPassword, activationLink });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/activate/${activationLink}`,
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.BadRequest('Неверные имя пользователя или пароль');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверные имя пользователя или пароль');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink) {
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      throw ApiError.BadRequest('Неккоректная ссылка активации');
    }

    user.isActivated = true;

    await user.save();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findByPk(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async changePassword(userId, newPassword) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }

    const hashPassword = await bcrypt.hash(newPassword, 3);
    user.password = hashPassword;

    await user.save();
    return user;
  }

  async resendActivationLink(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }
    if (user.isActivated) {
      throw ApiError.BadRequest('Пользователь уже активирован');
    }

    await mailService.sendActivationMail(
      user.email,
      `${process.env.API_URL}/activate/${user.activationLink}`,
    );

    return;
  }

  async sendResetPasswordLink(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }

    const { accessToken: resetToken } = tokenService.generateTokens({ email });

    await mailService.sendResetPasswordMail(
      user.email,
      `${process.env.CLIENT_URL}/reset?resetToken=${resetToken}&email=${user.email}`,
    );

    return;
  }

  async resetPassword(token, password) {
    if (!token || !password) {
      throw ApiError.BadRequest('Некорректные данные');
    }

    const { email } = tokenService.validateAccessToken(token);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }

    const hashPassword = await bcrypt.hash(password, 3);

    user.password = hashPassword;
    user.isActivated = true;

    await user.save();

    return user;
  }

  async loginVK(code, state, deviceId) {
    if (!code || !state || !deviceId) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: refreshToken, access_token: accessToken, user_id: vkUserId },
    } = await axios.post(
      'https://id.vk.com/oauth2/auth',
      {
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        redirect_uri: 'https://contentik-ai.ru/app',
        code: code,
        code_verifier: 'FGH767Gd65',
        grant_type: 'authorization_code',
        device_id: deviceId,
        state: state,
      },
      {
        params: {
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
          redirect_uri: 'https://contentik-ai.ru/app',
          code: code,
          code_verifier: 'FGH767Gd65',
          grant_type: 'authorization_code',
          device_id: deviceId,
          state: state,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const {
      data: {
        user: { first_name: firstName, last_name: lastName, email, avatar, birthday },
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

    const [user, isCreated] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        vkUserId,
        firstName,
        lastName,
        avatar,
        birthday,
        isActivated: true,
      },
    });

    if (!isCreated) {
      user.vkUserId = vkUserId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.avatar = avatar;
      user.birthday = birthday;
      user.isActivated = true;

      await user.save();
    }

    const userDto = new UserDto(user);

    const tokens = { accessToken, refreshToken };
    await tokenService.saveToken(userDto.id, refreshToken);

    return { ...tokens, user: userDto };
  }

  async refreshVK(refreshToken, deviceId) {
    if (!refreshToken || !deviceId) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: newRefreshToken, access_token: newAccessToken, user_id: vkUserId },
    } = await axios.post(
      'https://id.vk.com/oauth2/auth',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        device_id: deviceId,
      },
      {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
          device_id: deviceId,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!vkUserId) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findOne({ where: { vkUserId } });
    const userDto = new UserDto(user);
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logoutVK(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async getVKUser(vkUserId) {
    const user = await User.findOne({ where: { vkUserId } });
    const userDto = new UserDto(user);

    return userDto;
  }

  async loginYandex(code) {
    if (!code) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: refreshToken, access_token: accessToken },
    } = await axios.post(
      'https://oauth.yandex.ru/token',
      {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET,
        redirect_uri: 'https://contentik-ai.ru/app',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const {
      data: {
        id: yandexUserId,
        first_name: firstName,
        last_name: lastName,
        default_email: email,
        default_avatar_id: avatarId,
        birthday,
      },
    } = await axios.get('https://login.yandex.ru/info', {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    const [user, isCreated] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        yandexUserId,
        firstName,
        lastName,
        avatar: `https://avatars.yandex.net/get-yapic/${avatarId}/islands-middle`,
        birthday,
        isActivated: true,
      },
    });

    if (!isCreated) {
      user.yandexUserId = vkUserId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.avatar = `https://avatars.yandex.net/get-yapic/${avatarId}/islands-middle`;
      user.birthday = birthday;
      user.isActivated = true;

      await user.save();
    }

    const userDto = new UserDto(user);

    const tokens = { accessToken, refreshToken };
    await tokenService.saveToken(userDto.id, refreshToken);

    return { ...tokens, user: userDto };
  }

  async refreshYandex(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: newRefreshToken, access_token: newAccessToken },
    } = await axios.post(
      'https://oauth.yandex.ru/token',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const {
      data: { id: yandexUserId },
    } = await axios.get('https://login.yandex.ru/info', {
      headers: {
        Authorization: `OAuth ${newAccessToken}`,
      },
    });

    const user = await User.findOne({ where: { yandexUserId } });

    if (!user) {
      throw ApiError.UnauthorizedError();
    }

    const userDto = new UserDto(user);
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logoutYandex(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async getYandexUser(yandexUserId) {
    const user = await User.findOne({ where: { yandexUserId } });
    const userDto = new UserDto(user);

    return userDto;
  }
}

module.exports = new UserService();
