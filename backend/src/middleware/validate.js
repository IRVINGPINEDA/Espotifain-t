const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  res.status(422).json({
    message: 'Validation failed.',
    details: result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};
