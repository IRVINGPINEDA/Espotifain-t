const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must have at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must include a number.'),
  body('favoriteGenreIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Favorite genres must be a non-empty array.'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = {
  loginValidator,
  registerValidator,
};
