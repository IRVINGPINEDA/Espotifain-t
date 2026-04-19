const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch(
  '/preferences',
  body('favoriteGenreIds').isArray().withMessage('favoriteGenreIds must be an array.'),
  validate,
  userController.updatePreferences,
);
router.post(
  '/favorites/:songId',
  param('songId').isInt({ min: 1 }).withMessage('songId must be numeric.'),
  validate,
  userController.toggleFavorite,
);
router.get('/favorites', userController.getFavorites);
router.get('/history', userController.getHistory);
router.get('/library', userController.getLibraryOverview);

module.exports = router;
