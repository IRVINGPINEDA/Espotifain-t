const express = require('express');
const songController = require('../controllers/songController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { playSongValidator, songListValidator } = require('../validators/songValidators');
const { songIdParamValidator } = require('../validators/searchValidators');

const router = express.Router();

router.get('/', optionalAuth, songListValidator, validate, songController.listSongs);
router.get('/catalog/options', songController.getCatalogOptions);
router.get('/:songId', optionalAuth, songIdParamValidator, validate, songController.getSongById);
router.post('/:songId/play', optionalAuth, playSongValidator, validate, songController.playSong);

module.exports = router;
