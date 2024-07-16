const { body } = require('express-validator');
const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const contentController = require('../controllers/content-controller');
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

router.post('/generateContent', authMiddleware, contentController.generateContent);
router.post('/getContents', authMiddleware, contentController.getContents);
router.post('/deleteContent', authMiddleware, contentController.deleteContent);

module.exports = router;
