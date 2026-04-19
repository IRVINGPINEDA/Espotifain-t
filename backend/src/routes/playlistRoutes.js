const express = require('express');
const { param } = require('express-validator');
const playlistController = require('../controllers/playlistController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { playlistSongValidator, playlistValidator } = require('../validators/playlistValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', playlistController.getUserPlaylists);
router.post('/', playlistValidator, validate, playlistController.createPlaylist);
router.get(
  '/:playlistId',
  param('playlistId').isInt({ min: 1 }).withMessage('playlistId must be numeric.'),
  validate,
  playlistController.getPlaylist,
);
router.put(
  '/:playlistId',
  param('playlistId').isInt({ min: 1 }).withMessage('playlistId must be numeric.'),
  playlistValidator,
  validate,
  playlistController.updatePlaylist,
);
router.delete(
  '/:playlistId',
  param('playlistId').isInt({ min: 1 }).withMessage('playlistId must be numeric.'),
  validate,
  playlistController.deletePlaylist,
);
router.post('/:playlistId/songs', playlistSongValidator, validate, playlistController.addSongToPlaylist);
router.delete(
  '/:playlistId/songs/:songId',
  [
    param('playlistId').isInt({ min: 1 }).withMessage('playlistId must be numeric.'),
    param('songId').isInt({ min: 1 }).withMessage('songId must be numeric.'),
  ],
  validate,
  playlistController.removeSongFromPlaylist,
);

module.exports = router;
