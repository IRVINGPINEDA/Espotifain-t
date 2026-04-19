const { body, param } = require('express-validator');

const userUpdateValidator = [
  param('userId').isInt({ min: 1 }).withMessage('userId must be numeric.'),
  body('roleId').optional().isInt({ min: 1 }).withMessage('roleId must be numeric.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean.'),
];

const genreValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Genre name is required.'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description is too long.'),
];

const artistValidator = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Artist name is required.'),
  body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio is too long.'),
  body('country').optional().trim().isLength({ max: 80 }).withMessage('Country is too long.'),
  body('monthlyListeners')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('monthlyListeners must be numeric.'),
];

const albumValidator = [
  body('title').trim().isLength({ min: 2, max: 140 }).withMessage('Album title is required.'),
  body('artistId').isInt({ min: 1 }).withMessage('artistId is required.'),
  body('releaseYear').optional({ values: 'falsy' }).isInt({ min: 1900, max: 2100 }).withMessage('releaseYear must be valid.'),
  body('releaseDate').optional({ values: 'falsy' }).isISO8601().withMessage('releaseDate must be valid.'),
];

module.exports = {
  albumValidator,
  artistValidator,
  genreValidator,
  userUpdateValidator,
};
