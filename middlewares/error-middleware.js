const ApiError = require('../exceptions/api-error');

const errorMiddleware = function (err, _, res, _) {
  console.error(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  return res.status(500).json({ message: 'Непредвиденная ошибка' });
};

module.exports = errorMiddleware;
