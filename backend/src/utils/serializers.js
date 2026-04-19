const env = require('../config/env');

const asPublicUrl = (value) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? value : `${env.apiUrl.replace(/\/$/, '')}/${value}`;
};

const serializeGenre = (genre) => {
  if (!genre) {
    return null;
  }

  const item = genre.get ? genre.get({ plain: true }) : genre;
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    country: item.country,
  };
};

const serializeArtist = (artist) => {
  if (!artist) {
    return null;
  }

  const item = artist.get ? artist.get({ plain: true }) : artist;
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    bio: item.bio,
    country: item.country,
    monthlyListeners: item.monthlyListeners,
    imagePath: item.imagePath,
    imageUrl: asPublicUrl(item.imagePath),
  };
};

const serializeAlbum = (album) => {
  if (!album) {
    return null;
  }

  const item = album.get ? album.get({ plain: true }) : album;
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    releaseYear: item.releaseYear,
    releaseDate: item.releaseDate,
    coverImagePath: item.coverImagePath,
    coverImageUrl: asPublicUrl(item.coverImagePath),
    artist: serializeArtist(item.artist),
  };
};

const serializeSong = (song) => {
  if (!song) {
    return null;
  }

  const item = song.get ? song.get({ plain: true }) : song;
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    durationSeconds: item.durationSeconds,
    year: item.year,
    popularityScore: item.popularityScore,
    moodTags: item.moodTags || [],
    language: item.language,
    country: item.country,
    playCount: item.playCount,
    isPublished: item.isPublished,
    releaseDate: item.releaseDate,
    coverImagePath: item.coverImagePath,
    coverImageUrl: asPublicUrl(item.coverImagePath),
    audioFilePath: item.audioFilePath,
    audioFileUrl: asPublicUrl(item.audioFilePath),
    artist: serializeArtist(item.artist),
    album: serializeAlbum(item.album),
    genre: serializeGenre(item.genre),
  };
};

const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const item = user.get ? user.get({ plain: true }) : user;
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    isActive: item.isActive,
    role: item.role ? item.role.name : item.roleName || null,
    favoriteGenres: (item.genres || item.favoriteGenres || []).map(serializeGenre),
    createdAt: item.createdAt,
  };
};

module.exports = {
  asPublicUrl,
  serializeAlbum,
  serializeArtist,
  serializeGenre,
  serializeSong,
  serializeUser,
};
