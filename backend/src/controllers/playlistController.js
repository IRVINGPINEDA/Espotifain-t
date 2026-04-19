const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { serializeSong } = require('../utils/serializers');
const { Playlist, PlaylistSong, Song, songIncludes } = require('../models');

const toPlaylistPayload = (playlist) => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description,
  isPublic: playlist.isPublic,
  coverImagePath: playlist.coverImagePath,
  songCount: playlist.songs.length,
  songs: playlist.songs
    .sort((left, right) => (left.playlist_song?.position || 0) - (right.playlist_song?.position || 0))
    .map(serializeSong),
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.findAll({
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
  });

  res.json({
    playlists: playlists.map(toPlaylistPayload),
  });
});

const createPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create({
    userId: req.user.id,
    name: req.body.name,
    description: req.body.description,
    isPublic: req.body.isPublic ?? false,
  });

  const created = await Playlist.findByPk(playlist.id, {
    include: [
      {
        model: Song,
        as: 'songs',
        include: songIncludes,
        through: { attributes: ['position'] },
      },
    ],
  });

  res.status(201).json({
    playlist: toPlaylistPayload(created),
  });
});

const getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findByPk(req.params.playlistId, {
    include: [
      {
        model: Song,
        as: 'songs',
        include: songIncludes,
        through: { attributes: ['position'] },
      },
    ],
  });

  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.');
  }

  if (!playlist.isPublic && playlist.userId !== req.user.id) {
    throw new ApiError(403, 'This playlist is private.');
  }

  res.json({
    playlist: toPlaylistPayload(playlist),
  });
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findByPk(req.params.playlistId);

  if (!playlist || playlist.userId !== req.user.id) {
    throw new ApiError(404, 'Playlist not found.');
  }

  await playlist.update({
    name: req.body.name ?? playlist.name,
    description: req.body.description ?? playlist.description,
    isPublic: req.body.isPublic ?? playlist.isPublic,
  });

  const updated = await Playlist.findByPk(playlist.id, {
    include: [
      {
        model: Song,
        as: 'songs',
        include: songIncludes,
        through: { attributes: ['position'] },
      },
    ],
  });

  res.json({
    playlist: toPlaylistPayload(updated),
  });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findByPk(req.params.playlistId);

  if (!playlist || playlist.userId !== req.user.id) {
    throw new ApiError(404, 'Playlist not found.');
  }

  await playlist.destroy();
  res.json({ message: 'Playlist deleted.' });
});

const addSongToPlaylist = asyncHandler(async (req, res) => {
  const [playlist, song] = await Promise.all([
    Playlist.findByPk(req.params.playlistId),
    Song.findByPk(req.body.songId),
  ]);

  if (!playlist || playlist.userId !== req.user.id) {
    throw new ApiError(404, 'Playlist not found.');
  }

  if (!song || !song.isPublished) {
    throw new ApiError(404, 'Song not found.');
  }

  const position =
    req.body.position ??
    (await PlaylistSong.count({
      where: { playlistId: playlist.id },
    }));

  await PlaylistSong.findOrCreate({
    where: {
      playlistId: playlist.id,
      songId: song.id,
    },
    defaults: {
      position,
    },
  });

  const updated = await Playlist.findByPk(playlist.id, {
    include: [
      {
        model: Song,
        as: 'songs',
        include: songIncludes,
        through: { attributes: ['position'] },
      },
    ],
  });

  res.json({
    playlist: toPlaylistPayload(updated),
  });
});

const removeSongFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findByPk(req.params.playlistId);

  if (!playlist || playlist.userId !== req.user.id) {
    throw new ApiError(404, 'Playlist not found.');
  }

  await PlaylistSong.destroy({
    where: {
      playlistId: playlist.id,
      songId: req.params.songId,
    },
  });

  const updated = await Playlist.findByPk(playlist.id, {
    include: [
      {
        model: Song,
        as: 'songs',
        include: songIncludes,
        through: { attributes: ['position'] },
      },
    ],
  });

  res.json({
    playlist: toPlaylistPayload(updated),
  });
});

module.exports = {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getUserPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
};
