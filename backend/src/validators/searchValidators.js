const { param, query } = require('express-validator');

const searchValidator = [
  query('q').trim().isLength({ min: 1, max: 160 }).withMessage('Search query is required.'),
];

const songIdParamValidator = [
  param('songId').isInt({ min: 1 }).withMessage('songId must be numeric.'),
];

module.exports = {
  searchValidator,
  songIdParamValidator,
};
