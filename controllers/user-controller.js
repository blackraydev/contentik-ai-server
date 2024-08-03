const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Произошла ошибка при валидации данных', errors.array()));
      }

      const { email, password, deviceId } = req.body;
      const { user, refreshToken, accessToken } = await userService.registration(
        email,
        password,
        deviceId,
      );

      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, deviceId } = req.body;
      const { user, refreshToken, accessToken } = await userService.login(
        email,
        password,
        deviceId,
      );

      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = await userService.refresh(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      await userService.logout(refreshToken);

      res.clearCookie('refreshToken');

      return res.status(204).end();
    } catch (e) {
      next(e);
    }
  }

  async resendActivationLink(req, res, next) {
    try {
      const { email } = req.body;
      await userService.resendActivationLink(email);

      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }

  async sendResetPasswordLink(req, res, next) {
    try {
      const { email } = req.body;
      await userService.sendResetPasswordLink(email);

      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, password } = req.body;
      await userService.resetPassword(resetToken, password);

      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);

      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Произошла ошибка при смене пароля', errors.array()));
      }

      const { password } = req.body;
      const { id: userId } = req.user;
      await userService.changePassword(userId, password);

      return res.status(200).end();
    } catch (e) {
      next(e);
    }
  }

  async loginVK(req, res, next) {
    try {
      const { code, state, deviceId } = req.body;
      const { user, refreshToken, accessToken } = await userService.loginVK(code, state, deviceId);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie('deviceId', deviceId, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async refreshVK(req, res, next) {
    try {
      const { refreshToken, deviceId } = req.cookies;
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = await userService.refreshVK(refreshToken, deviceId);

      res.cookie('refreshToken', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie('deviceId', deviceId, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async logoutVK(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      await userService.logoutVK(refreshToken);

      res.clearCookie('refreshToken');
      res.clearCookie('deviceId');

      return res.status(204).end();
    } catch (e) {
      next(e);
    }
  }

  async loginYandex(req, res, next) {
    try {
      const { code } = req.body;
      const { user, refreshToken, accessToken } = await userService.loginYandex(code);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async refreshYandex(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = await userService.refreshYandex(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async logoutYandex(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      await userService.logoutYandex(refreshToken);

      res.clearCookie('refreshToken');

      return res.status(204).end();
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
