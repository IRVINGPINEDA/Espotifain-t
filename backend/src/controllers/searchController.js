const asyncHandler = require('../utils/asyncHandler');
const { serializeAlbum, serializeArtist, serializeGenre, serializeSong } = require('../utils/serializers');
const { Album, Artist, Genre, SearchHistory, Song, Op, songIncludes } = require('../models');

const searchAll = asyncHandler(async (req, res) => {
  const q = req.query.q.trim();

  const [songs, artists, albums, genres] = await Promise.all([
    Song.findAll({
      where: {
        isPublished: true,
        title: { [Op.like]: `%${q}%` },
      },
      include: songIncludes,
      limit: 10,
      order: [['popularityScore', 'DESC'], ['playCount', 'DESC']],
    }),
    Artist.findAll({
      where: { name: { [Op.like]: `%${q}%` } },
      limit: 6,
      order: [['monthlyListeners', 'DESC']],
    }),
    Album.findAll({
      where: { title: { [Op.like]: `%${q}%` } },
      include: [{ model: Artist }],
      limit: 6,
      order: [['createdAt', 'DESC']],
    }),
    Genre.findAll({
      where: { name: { [Op.like]: `%${q}%` } },
      limit: 6,
      order: [['name', 'ASC']],
    }),
  ]);

  if (req.user) {
    await SearchHistory.create({
      userId: req.user.id,
      query: q,
      searchedAt: new Date(),
    });
  }

  res.json({
    query: q,
    songs: songs.map(serializeSong),
    artists: artists.map(serializeArtist),
    albums: albums.map(serializeAlbum),
    genres: genres.map(serializeGenre),
  });
});

const getRecentSearches = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.json({ items: [] });
    return;
  }

  const items = await SearchHistory.findAll({
    where: { userId: req.user.id },
    order: [['searchedAt', 'DESC']],
    limit: 12,
  });

  res.json({
    items: items.map((item) => ({
      id: item.id,
      query: item.query,
      searchedAt: item.searchedAt,
    })),
  });
});

module.exports = {
  getRecentSearches,
  searchAll,
};
