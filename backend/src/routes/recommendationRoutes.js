const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { songIdParamValidator } = require('../validators/searchValidators');

const router = express.Router();

router.get('/', optionalAuth, recommendationController.homeFeed);
router.get('/autoplay/:songId', optionalAuth, songIdParamValidator, validate, recommendationController.autoplay);

module.exports = router;
