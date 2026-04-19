const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt');
const { serializeGenre, serializeUser } = require('../utils/serializers');
const { Genre, Role, User } = require('../models');

const register = asyncHandler(async (req, res) => {
  const { email, favoriteGenreIds = [], name, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const userRole = await Role.findOne({ where: { name: 'user' } });
  if (!userRole) {
    throw new ApiError(500, 'Default user role is missing.');
  }

  const genres = favoriteGenreIds.length
    ? await Genre.findAll({ where: { id: favoriteGenreIds } })
    : [];

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    roleId: userRole.id,
  });

  if (genres.length) {
    await user.setGenres(genres);
  }

  const hydratedUser = await User.findByPk(user.id, {
    include: [{ model: Role }, { model: Genre }],
  });

  res.status(201).json({
    token: signToken({ userId: user.id, role: 'user' }),
    user: serializeUser(hydratedUser),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role }, { model: Genre }],
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account is currently disabled.');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  res.json({
    token: signToken({ userId: user.id, role: user.role.name }),
    user: serializeUser(user),
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    user: serializeUser(req.user),
  });
});

const getPreferenceGenres = asyncHandler(async (req, res) => {
  const genres = await Genre.findAll({
    where: { isFeatured: true },
    order: [['id', 'ASC']],
  });

  res.json({
    genres: genres.map(serializeGenre),
  });
});

module.exports = {
  getPreferenceGenres,
  login,
  me,
  register,
};
