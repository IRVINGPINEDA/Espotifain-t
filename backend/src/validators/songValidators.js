const { body, param, query } = require('express-validator');

const songListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
];

const playSongValidator = [
  param('songId').isInt({ min: 1 }).withMessage('Song id must be numeric.'),
  body('secondsPlayed').optional().isInt({ min: 0 }).withMessage('secondsPlayed must be a positive integer.'),
  body('completed').optional().isBoolean().withMessage('completed must be boolean.'),
];

const adminSongValidator = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('Title is required.'),
  body('artistId').isInt({ min: 1 }).withMessage('artistId is required.'),
  body('genreId').isInt({ min: 1 }).withMessage('genreId is required.'),
  body('durationSeconds').isInt({ min: 1 }).withMessage('durationSeconds is required.'),
  body('year').optional({ values: 'falsy' }).isInt({ min: 1900, max: 2100 }).withMessage('year must be valid.'),
  body('popularityScore')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 100 })
    .withMessage('popularityScore must be between 0 and 100.'),
  body('releaseDate').optional({ values: 'falsy' }).isISO8601().withMessage('releaseDate must be valid.'),
  body('albumId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('albumId must be numeric.'),
];

module.exports = {
  adminSongValidator,
  playSongValidator,
  songListValidator,
};
