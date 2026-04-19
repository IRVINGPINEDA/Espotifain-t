const ApiError = require('../utils/apiError');

const authorize = (...roles) => (req, res, next) => {
  const userRole = req.user?.role?.name;

  if (!userRole || !roles.includes(userRole)) {
    next(new ApiError(403, 'You do not have permission to perform this action.'));
    return;
  }

  next();
};

module.exports = authorize;
