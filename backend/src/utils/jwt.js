const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = {
  signToken,
  verifyToken,
};
