const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Song, songIncludes } = require('../models');
const { getAutoplaySuggestion, getExploreData, getHomeFeed } = require('../services/recommendationService');

const homeFeed = asyncHandler(async (req, res) => {
  const feed = await getHomeFeed(req.user);
  const explore = await getExploreData();

  res.json({
    ...feed,
    ...explore,
  });
});

const autoplay = asyncHandler(async (req, res) => {
  const song = await Song.findByPk(req.params.songId, {
    include: songIncludes,
  });

  if (!song) {
    throw new ApiError(404, 'Song not found.');
  }

  const nextSong = await getAutoplaySuggestion(song, req.user);

  res.json({
    currentSongId: song.id,
    nextSong,
  });
});

module.exports = {
  autoplay,
  homeFeed,
};
