const { body } = require('express-validator');
const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const contentController = require('../controllers/content-controller');
const tariffController = require('../controllers/tariff-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = new Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 128 }),
  userController.registration,
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.post(
  '/changePassword',
  authMiddleware,
  body('password').isLength({ min: 6, max: 128 }),
  userController.changePassword,
);
router.post('/resendActivationLink', userController.resendActivationLink);
router.post('/sendResetLink', userController.sendResetPasswordLink);
router.post('/resetPassword', userController.resetPassword);

router.post('/loginVK', userController.loginVK);
router.get('/refreshVK', userController.refreshVK);
router.post('/logoutVK', userController.logoutVK);

router.post('/loginYandex', userController.loginYandex);
router.get('/refreshYandex', userController.refreshYandex);
router.post('/logoutYandex', userController.logoutYandex);

router.post('/generateContent', authMiddleware, contentController.generateContent);
router.post('/getContents', authMiddleware, contentController.getContents);
router.post('/deleteContent', authMiddleware, contentController.deleteContent);

router.get('/tariff', authMiddleware, tariffController.getTariff);
router.post('/checkoutTariff', authMiddleware, tariffController.checkoutTariff);
router.post('/tariffWebhook', tariffController.tariffWebhook);
router.post(
  '/declineSubscriptionTariff',
  authMiddleware,
  tariffController.declineSubscriptionTariff,
);

module.exports = router;
