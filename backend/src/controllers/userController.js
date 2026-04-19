const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { serializeGenre, serializeSong, serializeUser } = require('../utils/serializers');
const { Favorite, Genre, History, Playlist, PlaylistSong, Role, Song, User, songIncludes } = require('../models');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role }, { model: Genre }],
  });

  res.json({
    user: serializeUser(user),
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { favoriteGenreIds = [] } = req.body;
  const genres = favoriteGenreIds.length
    ? await Genre.findAll({ where: { id: favoriteGenreIds } })
    : [];

  await req.user.setGenres(genres);

  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role }, { model: Genre }],
  });

  res.json({
    message: 'Preferences updated.',
    user: serializeUser(user),
    favoriteGenres: genres.map(serializeGenre),
  });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId);
  if (!song) {
    throw new ApiError(404, 'Song not found.');
  }

  const existing = await Favorite.findOne({
    where: {
      userId: req.user.id,
      songId: song.id,
    },
  });

  if (existing) {
    await existing.destroy();
    res.json({ message: 'Song removed from favorites.', isFavorite: false });
    return;
  }

  await Favorite.create({
    userId: req.user.id,
    songId: song.id,
  });

  res.json({ message: 'Song added to favorites.', isFavorite: true });
});

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [{ model: Song, include: songIncludes }],
    order: [['createdAt', 'DESC']],
  });

  res.json({
    songs: favorites.map((item) => serializeSong(item.song)).filter(Boolean),
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await History.findAll({
    where: { userId: req.user.id },
    include: [{ model: Song, include: songIncludes }],
    order: [['playedAt', 'DESC']],
    limit: 50,
  });

  res.json({
    items: history.map((item) => ({
      id: item.id,
      playedAt: item.playedAt,
      secondsPlayed: item.secondsPlayed,
      completed: item.completed,
      song: serializeSong(item.song),
    })),
  });
});

const getLibraryOverview = asyncHandler(async (req, res) => {
  const [favorites, history, playlists] = await Promise.all([
    Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, include: songIncludes }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    }),
    History.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, include: songIncludes }],
      order: [['playedAt', 'DESC']],
      limit: 10,
    }),
    Playlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Song,
          as: 'songs',
          include: songIncludes,
          through: {
            attributes: ['position'],
          },
        },
      ],
      order: [['updatedAt', 'DESC']],
    }),
  ]);

  res.json({
    favorites: favorites.map((item) => serializeSong(item.song)).filter(Boolean),
    history: history.map((item) => ({
      id: item.id,
      playedAt: item.playedAt,
      song: serializeSong(item.song),
    })),
    playlists: playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      coverImagePath: playlist.coverImagePath,
      songCount: playlist.songs.length,
      songs: playlist.songs
        .sort((left, right) => (left.playlist_song?.position || 0) - (right.playlist_song?.position || 0))
        .map(serializeSong),
    })),
  });
});

module.exports = {
  getFavorites,
  getHistory,
  getLibraryOverview,
  getProfile,
  toggleFavorite,
  updatePreferences,
};
