const { Op } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { serializeAlbum, serializeArtist, serializeGenre, serializeSong } = require('../utils/serializers');
const { Album, Artist, Favorite, Genre, History, Song, songIncludes } = require('../models');

const listSongs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 24);
  const offset = (page - 1) * limit;
  const q = req.query.q?.trim();
  const genreId = req.query.genreId;
  const artistId = req.query.artistId;
  const albumId = req.query.albumId;

  const where = {
    isPublished: true,
  };

  if (genreId) {
    where.genreId = genreId;
  }

  if (artistId) {
    where.artistId = artistId;
  }

  if (albumId) {
    where.albumId = albumId;
  }

  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { '$artist.name$': { [Op.like]: `%${q}%` } },
      { '$album.title$': { [Op.like]: `%${q}%` } },
      { '$genre.name$': { [Op.like]: `%${q}%` } },
    ];
  }

  const { count, rows } = await Song.findAndCountAll({
    where,
    include: songIncludes,
    order: [['popularityScore', 'DESC'], ['createdAt', 'DESC']],
    offset,
    limit,
    distinct: true,
  });

  let favoriteSongIds = [];
  if (req.user) {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      attributes: ['songId'],
    });
    favoriteSongIds = favorites.map((favorite) => favorite.songId);
  }

  res.json({
    page,
    totalPages: Math.ceil(count / limit),
    total: count,
    songs: rows.map((song) => ({
      ...serializeSong(song),
      isFavorite: favoriteSongIds.includes(song.id),
    })),
  });
});

const getSongById = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId, {
    include: songIncludes,
  });

  if (!song || !song.isPublished) {
    throw new ApiError(404, 'Song not found.');
  }

  let isFavorite = false;
  if (req.user) {
    const favorite = await Favorite.findOne({
      where: { userId: req.user.id, songId: song.id },
    });
    isFavorite = Boolean(favorite);
  }

  res.json({
    song: {
      ...serializeSong(song),
      isFavorite,
    },
  });
});

const playSong = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId, {
    include: songIncludes,
  });

  if (!song || !song.isPublished) {
    throw new ApiError(404, 'Song not found.');
  }

  await song.increment('playCount');

  if (req.user) {
    await History.create({
      userId: req.user.id,
      songId: song.id,
      playedAt: new Date(),
      secondsPlayed: Number(req.body.secondsPlayed || 0),
      completed: Boolean(req.body.completed),
    });
  }

  res.json({
    message: 'Playback registered.',
    song: serializeSong(song),
  });
});

const getCatalogOptions = asyncHandler(async (req, res) => {
  const [genres, artists, albums] = await Promise.all([
    Genre.findAll({ order: [['name', 'ASC']] }),
    Artist.findAll({ order: [['name', 'ASC']] }),
    Album.findAll({ include: [{ model: Artist }], order: [['title', 'ASC']] }),
  ]);

  res.json({
    genres: genres.map(serializeGenre),
    artists: artists.map(serializeArtist),
    albums: albums.map(serializeAlbum),
  });
});

module.exports = {
  getCatalogOptions,
  getSongById,
  listSongs,
  playSong,
};
