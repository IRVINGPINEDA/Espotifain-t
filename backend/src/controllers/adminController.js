const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { normalizeUploadPath, removeUpload } = require('../config/multer');
const { generateUniqueSlug } = require('../utils/slug');
const { serializeAlbum, serializeArtist, serializeGenre, serializeSong, serializeUser } = require('../utils/serializers');
const { Album, Artist, Favorite, Genre, History, Playlist, Role, SearchHistory, Song, User, songIncludes } = require('../models');

const parseArrayInput = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error) {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getDashboard = asyncHandler(async (req, res) => {
  const [users, songs, artists, playlists, favorites, history, searches, recentUsers, topSongs] = await Promise.all([
    User.count(),
    Song.count(),
    Artist.count(),
    Playlist.count(),
    Favorite.count(),
    History.count(),
    SearchHistory.count(),
    User.findAll({
      include: [{ model: Role }, { model: Genre }],
      limit: 6,
      order: [['createdAt', 'DESC']],
    }),
    Song.findAll({
      include: songIncludes,
      limit: 8,
      order: [['playCount', 'DESC'], ['popularityScore', 'DESC']],
    }),
  ]);

  res.json({
    metrics: {
      totalUsers: users,
      totalSongs: songs,
      totalArtists: artists,
      totalPlaylists: playlists,
      totalFavorites: favorites,
      totalStreams: history,
      totalSearches: searches,
    },
    recentUsers: recentUsers.map(serializeUser),
    topSongs: topSongs.map(serializeSong),
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Role }, { model: Genre }],
    order: [['createdAt', 'DESC']],
  });

  res.json({
    users: users.map(serializeUser),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId, {
    include: [{ model: Role }, { model: Genre }],
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const updates = {};

  if (typeof req.body.isActive !== 'undefined') {
    updates.isActive = req.body.isActive;
  }

  if (req.body.roleId) {
    const role = await Role.findByPk(req.body.roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found.');
    }
    updates.roleId = role.id;
  }

  await user.update(updates);

  const updated = await User.findByPk(user.id, {
    include: [{ model: Role }, { model: Genre }],
  });

  res.json({
    user: serializeUser(updated),
  });
});

const getCatalog = asyncHandler(async (req, res) => {
  const [genres, artists, albums, songs, roles] = await Promise.all([
    Genre.findAll({ order: [['name', 'ASC']] }),
    Artist.findAll({ order: [['name', 'ASC']] }),
    Album.findAll({ include: [{ model: Artist }], order: [['title', 'ASC']] }),
    Song.findAll({ include: songIncludes, order: [['createdAt', 'DESC']] }),
    Role.findAll({ order: [['id', 'ASC']] }),
  ]);

  res.json({
    genres: genres.map(serializeGenre),
    artists: artists.map(serializeArtist),
    albums: albums.map(serializeAlbum),
    songs: songs.map(serializeSong),
    roles: roles.map((role) => ({ id: role.id, name: role.name })),
  });
});

const createGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.create({
    name: req.body.name,
    slug: await generateUniqueSlug(Genre, req.body.name),
    description: req.body.description,
    country: req.body.country || 'Mexico',
    isFeatured: req.body.isFeatured ?? true,
  });

  res.status(201).json({
    genre: serializeGenre(genre),
  });
});

const updateGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByPk(req.params.genreId);
  if (!genre) {
    throw new ApiError(404, 'Genre not found.');
  }

  const nextName = req.body.name ?? genre.name;
  await genre.update({
    name: nextName,
    slug: await generateUniqueSlug(Genre, nextName, genre.id),
    description: req.body.description ?? genre.description,
    country: req.body.country ?? genre.country,
    isFeatured: req.body.isFeatured ?? genre.isFeatured,
  });

  res.json({
    genre: serializeGenre(genre),
  });
});

const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByPk(req.params.genreId);
  if (!genre) {
    throw new ApiError(404, 'Genre not found.');
  }

  await genre.destroy();
  res.json({ message: 'Genre deleted.' });
});

const createArtist = asyncHandler(async (req, res) => {
  const imagePath = req.file ? normalizeUploadPath(req.file.path) : null;

  const artist = await Artist.create({
    name: req.body.name,
    slug: await generateUniqueSlug(Artist, req.body.name),
    bio: req.body.bio,
    country: req.body.country || 'Mexico',
    monthlyListeners: Number(req.body.monthlyListeners || 0),
    imagePath,
  });

  res.status(201).json({
    artist: serializeArtist(artist),
  });
});

const updateArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findByPk(req.params.artistId);
  if (!artist) {
    throw new ApiError(404, 'Artist not found.');
  }

  const nextName = req.body.name ?? artist.name;
  const imagePath = req.file ? normalizeUploadPath(req.file.path) : artist.imagePath;

  if (req.file && artist.imagePath) {
    removeUpload(artist.imagePath);
  }

  await artist.update({
    name: nextName,
    slug: await generateUniqueSlug(Artist, nextName, artist.id),
    bio: req.body.bio ?? artist.bio,
    country: req.body.country ?? artist.country,
    monthlyListeners: Number(req.body.monthlyListeners ?? artist.monthlyListeners),
    imagePath,
  });

  res.json({
    artist: serializeArtist(artist),
  });
});

const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findByPk(req.params.artistId);
  if (!artist) {
    throw new ApiError(404, 'Artist not found.');
  }

  if (artist.imagePath) {
    removeUpload(artist.imagePath);
  }

  await artist.destroy();
  res.json({ message: 'Artist deleted.' });
});

const createAlbum = asyncHandler(async (req, res) => {
  const artist = await Artist.findByPk(req.body.artistId);
  if (!artist) {
    throw new ApiError(404, 'Artist not found.');
  }

  const coverImagePath = req.file ? normalizeUploadPath(req.file.path) : null;

  const album = await Album.create({
    title: req.body.title,
    slug: await generateUniqueSlug(Album, `${req.body.title}-${artist.name}`),
    artistId: artist.id,
    releaseYear: req.body.releaseYear || null,
    releaseDate: req.body.releaseDate || null,
    coverImagePath,
  });

  const hydrated = await Album.findByPk(album.id, {
    include: [{ model: Artist }],
  });

  res.status(201).json({
    album: serializeAlbum(hydrated),
  });
});

const updateAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findByPk(req.params.albumId, {
    include: [{ model: Artist }],
  });

  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  const nextArtistId = req.body.artistId ?? album.artistId;
  const artist = await Artist.findByPk(nextArtistId);
  if (!artist) {
    throw new ApiError(404, 'Artist not found.');
  }

  const coverImagePath = req.file ? normalizeUploadPath(req.file.path) : album.coverImagePath;
  if (req.file && album.coverImagePath) {
    removeUpload(album.coverImagePath);
  }

  const nextTitle = req.body.title ?? album.title;
  await album.update({
    title: nextTitle,
    slug: await generateUniqueSlug(Album, `${nextTitle}-${artist.name}`, album.id),
    artistId: artist.id,
    releaseYear: req.body.releaseYear ?? album.releaseYear,
    releaseDate: req.body.releaseDate ?? album.releaseDate,
    coverImagePath,
  });

  const updated = await Album.findByPk(album.id, {
    include: [{ model: Artist }],
  });

  res.json({
    album: serializeAlbum(updated),
  });
});

const deleteAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findByPk(req.params.albumId);
  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  if (album.coverImagePath) {
    removeUpload(album.coverImagePath);
  }

  await album.destroy();
  res.json({ message: 'Album deleted.' });
});

const createSong = asyncHandler(async (req, res) => {
  const audioFile = req.files?.audioFile?.[0];
  if (!audioFile) {
    throw new ApiError(422, 'Audio file is required.');
  }

  const [artist, genre] = await Promise.all([
    Artist.findByPk(req.body.artistId),
    Genre.findByPk(req.body.genreId),
  ]);

  if (!artist || !genre) {
    throw new ApiError(404, 'Artist or genre not found.');
  }

  const album = req.body.albumId ? await Album.findByPk(req.body.albumId) : null;
  const coverImageFile = req.files?.coverImage?.[0];

  const song = await Song.create({
    title: req.body.title,
    slug: await generateUniqueSlug(Song, `${req.body.title}-${artist.name}`),
    artistId: artist.id,
    albumId: album?.id || null,
    genreId: genre.id,
    coverImagePath: coverImageFile ? normalizeUploadPath(coverImageFile.path) : album?.coverImagePath || null,
    audioFilePath: normalizeUploadPath(audioFile.path),
    durationSeconds: Number(req.body.durationSeconds),
    year: req.body.year || null,
    popularityScore: Number(req.body.popularityScore || 50),
    moodTags: parseArrayInput(req.body.moodTags),
    language: req.body.language || 'Spanish',
    country: req.body.country || 'Mexico',
    releaseDate: req.body.releaseDate || null,
    isPublished: req.body.isPublished !== 'false',
  });

  const hydrated = await Song.findByPk(song.id, { include: songIncludes });

  res.status(201).json({
    song: serializeSong(hydrated),
  });
});

const updateSong = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId, {
    include: songIncludes,
  });

  if (!song) {
    throw new ApiError(404, 'Song not found.');
  }

  const nextArtistId = req.body.artistId ?? song.artistId;
  const nextGenreId = req.body.genreId ?? song.genreId;

  const [artist, genre] = await Promise.all([
    Artist.findByPk(nextArtistId),
    Genre.findByPk(nextGenreId),
  ]);

  if (!artist || !genre) {
    throw new ApiError(404, 'Artist or genre not found.');
  }

  const album = req.body.albumId ? await Album.findByPk(req.body.albumId) : song.albumId ? await Album.findByPk(song.albumId) : null;
  const coverImageFile = req.files?.coverImage?.[0];
  const audioFile = req.files?.audioFile?.[0];

  if (coverImageFile && song.coverImagePath) {
    removeUpload(song.coverImagePath);
  }

  if (audioFile && song.audioFilePath) {
    removeUpload(song.audioFilePath);
  }

  const nextTitle = req.body.title ?? song.title;
  await song.update({
    title: nextTitle,
    slug: await generateUniqueSlug(Song, `${nextTitle}-${artist.name}`, song.id),
    artistId: artist.id,
    albumId: album?.id || null,
    genreId: genre.id,
    coverImagePath: coverImageFile
      ? normalizeUploadPath(coverImageFile.path)
      : song.coverImagePath || album?.coverImagePath || null,
    audioFilePath: audioFile ? normalizeUploadPath(audioFile.path) : song.audioFilePath,
    durationSeconds: Number(req.body.durationSeconds ?? song.durationSeconds),
    year: req.body.year ?? song.year,
    popularityScore: Number(req.body.popularityScore ?? song.popularityScore),
    moodTags: req.body.moodTags ? parseArrayInput(req.body.moodTags) : song.moodTags,
    language: req.body.language ?? song.language,
    country: req.body.country ?? song.country,
    releaseDate: req.body.releaseDate ?? song.releaseDate,
    isPublished:
      typeof req.body.isPublished === 'undefined'
        ? song.isPublished
        : String(req.body.isPublished) === 'true',
  });

  const updated = await Song.findByPk(song.id, { include: songIncludes });

  res.json({
    song: serializeSong(updated),
  });
});

const deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId);
  if (!song) {
    throw new ApiError(404, 'Song not found.');
  }

  if (song.coverImagePath) {
    removeUpload(song.coverImagePath);
  }
  if (song.audioFilePath) {
    removeUpload(song.audioFilePath);
  }

  await song.destroy();
  res.json({ message: 'Song deleted.' });
});

module.exports = {
  createAlbum,
  createArtist,
  createGenre,
  createSong,
  deleteAlbum,
  deleteArtist,
  deleteGenre,
  deleteSong,
  getCatalog,
  getDashboard,
  getUsers,
  updateAlbum,
  updateArtist,
  updateGenre,
  updateSong,
  updateUser,
};
