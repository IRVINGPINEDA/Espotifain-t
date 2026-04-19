const express = require('express');
const { param } = require('express-validator');
const adminController = require('../controllers/adminController');
const { upload } = require('../config/multer');
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { albumValidator, artistValidator, genreValidator, userUpdateValidator } = require('../validators/adminValidators');
const { adminSongValidator } = require('../validators/songValidators');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId', userUpdateValidator, validate, adminController.updateUser);
router.get('/catalog', adminController.getCatalog);

router.post('/genres', genreValidator, validate, adminController.createGenre);
router.put(
  '/genres/:genreId',
  [param('genreId').isInt({ min: 1 }).withMessage('genreId must be numeric.'), ...genreValidator],
  validate,
  adminController.updateGenre,
);
router.delete(
  '/genres/:genreId',
  param('genreId').isInt({ min: 1 }).withMessage('genreId must be numeric.'),
  validate,
  adminController.deleteGenre,
);

router.post('/artists', upload.single('image'), artistValidator, validate, adminController.createArtist);
router.put(
  '/artists/:artistId',
  upload.single('image'),
  [param('artistId').isInt({ min: 1 }).withMessage('artistId must be numeric.'), ...artistValidator],
  validate,
  adminController.updateArtist,
);
router.delete(
  '/artists/:artistId',
  param('artistId').isInt({ min: 1 }).withMessage('artistId must be numeric.'),
  validate,
  adminController.deleteArtist,
);

router.post('/albums', upload.single('coverImage'), albumValidator, validate, adminController.createAlbum);
router.put(
  '/albums/:albumId',
  upload.single('coverImage'),
  [param('albumId').isInt({ min: 1 }).withMessage('albumId must be numeric.'), ...albumValidator],
  validate,
  adminController.updateAlbum,
);
router.delete(
  '/albums/:albumId',
  param('albumId').isInt({ min: 1 }).withMessage('albumId must be numeric.'),
  validate,
  adminController.deleteAlbum,
);

router.post(
  '/songs',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
  ]),
  adminSongValidator,
  validate,
  adminController.createSong,
);
router.put(
  '/songs/:songId',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
  ]),
  [param('songId').isInt({ min: 1 }).withMessage('songId must be numeric.')],
  validate,
  adminController.updateSong,
);
router.delete(
  '/songs/:songId',
  param('songId').isInt({ min: 1 }).withMessage('songId must be numeric.'),
  validate,
  adminController.deleteSong,
);

module.exports = router;
