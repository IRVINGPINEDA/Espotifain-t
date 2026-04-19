const { Artist, Favorite, Genre, History, Song, songIncludes } = require('../models');
const { serializeArtist, serializeSong } = require('../utils/serializers');

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

const overlapScore = (left = [], right = []) => left.filter((item) => right.includes(item)).length;

const getPersonalizationSignals = async (user) => {
  if (!user) {
    return {
      favoriteGenreIds: [],
      likedSongs: [],
      historySongs: [],
      artistIds: [],
      moodTags: [],
    };
  }

  const favoriteGenreIds = (user.genres || []).map((genre) => genre.id);

  const [favorites, history] = await Promise.all([
    Favorite.findAll({
      where: { userId: user.id },
      include: [{ model: Song, include: songIncludes }],
      limit: 40,
      order: [['createdAt', 'DESC']],
    }),
    History.findAll({
      where: { userId: user.id },
      include: [{ model: Song, include: songIncludes }],
      limit: 60,
      order: [['playedAt', 'DESC']],
    }),
  ]);

  const likedSongs = favorites.map((item) => item.song).filter(Boolean);
  const historySongs = history.map((item) => item.song).filter(Boolean);
  const allSongs = [...likedSongs, ...historySongs];

  return {
    favoriteGenreIds,
    likedSongs,
    historySongs,
    artistIds: [...new Set(allSongs.map((song) => song.artistId).filter(Boolean))],
    moodTags: [...new Set(allSongs.flatMap((song) => song.moodTags || []))],
  };
};

const rankSongs = (songs, signals) =>
  songs
    .map((song) => {
      let score = (song.popularityScore || 0) * 1.4 + (song.playCount || 0) * 0.05;

      if (signals.favoriteGenreIds.includes(song.genreId)) {
        score += 30;
      }

      if (signals.artistIds.includes(song.artistId)) {
        score += 24;
      }

      score += overlapScore(song.moodTags || [], signals.moodTags) * 6;

      if (song.country?.toLowerCase() === 'mexico') {
        score += 8;
      }

      return {
        song,
        score,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((item) => item.song);

const getHomeFeed = async (user) => {
  const signals = await getPersonalizationSignals(user);
  const [allSongs, trending, newReleases, artists] = await Promise.all([
    Song.findAll({
      where: { isPublished: true },
      include: songIncludes,
      limit: 150,
      order: [['popularityScore', 'DESC'], ['playCount', 'DESC']],
    }),
    Song.findAll({
      where: { isPublished: true, country: 'Mexico' },
      include: songIncludes,
      limit: 12,
      order: [['playCount', 'DESC'], ['popularityScore', 'DESC']],
    }),
    Song.findAll({
      where: { isPublished: true },
      include: songIncludes,
      limit: 12,
      order: [['releaseDate', 'DESC'], ['createdAt', 'DESC']],
    }),
    Artist.findAll({
      limit: 8,
      include: [{ model: Song, attributes: ['id'] }],
      order: [['monthlyListeners', 'DESC'], ['name', 'ASC']],
    }),
  ]);

  const ranked = rankSongs(allSongs, signals);
  const basedOnGenres = allSongs.filter((song) => signals.favoriteGenreIds.includes(song.genreId));

  const likedGenres = [...new Set(signals.likedSongs.map((song) => song.genreId).filter(Boolean))];
  const likedArtists = [...new Set(signals.likedSongs.map((song) => song.artistId).filter(Boolean))];
  const similarToLikes = allSongs.filter(
    (song) =>
      likedGenres.includes(song.genreId) ||
      likedArtists.includes(song.artistId) ||
      overlapScore(song.moodTags || [], signals.moodTags) > 0,
  );

  return {
    recommendedForYou: uniqueById(ranked).slice(0, 12).map(serializeSong),
    basedOnYourGenres: uniqueById(basedOnGenres).slice(0, 12).map(serializeSong),
    trendingInMexico: uniqueById(trending).slice(0, 12).map(serializeSong),
    similarToYourLikes: uniqueById(similarToLikes).slice(0, 12).map(serializeSong),
    newReleases: uniqueById(newReleases).slice(0, 12).map(serializeSong),
    popularArtists: uniqueById(artists).map(serializeArtist),
  };
};

const getAutoplaySuggestion = async (song, user) => {
  const signals = await getPersonalizationSignals(user);
  const candidates = await Song.findAll({
    where: {
      isPublished: true,
    },
    include: songIncludes,
    limit: 80,
    order: [['popularityScore', 'DESC'], ['playCount', 'DESC']],
  });

  const ranked = candidates
    .filter((candidate) => candidate.id !== song.id)
    .map((candidate) => {
      let score = 0;

      if (candidate.artistId === song.artistId) {
        score += 40;
      }

      if (candidate.genreId === song.genreId) {
        score += 25;
      }

      score += overlapScore(candidate.moodTags || [], song.moodTags || []) * 8;
      score += overlapScore(candidate.moodTags || [], signals.moodTags) * 4;
      score -= Math.abs((candidate.popularityScore || 0) - (song.popularityScore || 0));

      return { candidate, score };
    })
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.candidate ? serializeSong(ranked[0].candidate) : null;
};

const getExploreData = async () => {
  const genres = await Genre.findAll({
    where: { isFeatured: true },
    order: [['name', 'ASC']],
  });

  return {
    genres: genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      country: genre.country,
    })),
  };
};

module.exports = {
  getAutoplaySuggestion,
  getExploreData,
  getHomeFeed,
};
