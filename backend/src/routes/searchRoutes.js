const express = require('express');
const searchController = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { searchValidator } = require('../validators/searchValidators');

const router = express.Router();

router.get('/', optionalAuth, searchValidator, validate, searchController.searchAll);
router.get('/recent', optionalAuth, searchController.getRecentSearches);

module.exports = router;
