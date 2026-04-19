const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/jwt');
const { User, Role, Genre } = require('../models');

const loadUser = async (userId) =>
  User.findByPk(userId, {
    include: [
      { model: Role },
      { model: Genre },
    ],
  });

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required.');
  }

  const token = header.replace('Bearer ', '').trim();
  const payload = verifyToken(token);
  const user = await loadUser(payload.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User is not authorized.');
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    next();
    return;
  }

  try {
    const token = header.replace('Bearer ', '').trim();
    const payload = verifyToken(token);
    req.user = await loadUser(payload.userId);
  } catch (error) {
    req.user = null;
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};
