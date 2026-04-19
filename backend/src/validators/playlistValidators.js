const { body, param } = require('express-validator');

const playlistValidator = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Playlist name is required.'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description is too long.'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean.'),
];

const playlistSongValidator = [
  param('playlistId').isInt({ min: 1 }).withMessage('playlistId must be numeric.'),
  body('songId').isInt({ min: 1 }).withMessage('songId must be numeric.'),
  body('position').optional().isInt({ min: 0 }).withMessage('position must be zero or greater.'),
];

module.exports = {
  playlistSongValidator,
  playlistValidator,
};
