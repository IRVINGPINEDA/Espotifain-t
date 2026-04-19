const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const commonOptions = {
  timestamps: true,
};

const Role = sequelize.define(
  'role',
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  commonOptions,
);

const User = sequelize.define(
  'user',
  {
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  commonOptions,
);

const Genre = sequelize.define(
  'genre',
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Mexico',
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  commonOptions,
);

const Artist = sequelize.define(
  'artist',
  {
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(140),
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Mexico',
    },
    monthlyListeners: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imagePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  commonOptions,
);

const Album = sequelize.define(
  'album',
  {
    title: {
      type: DataTypes.STRING(140),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
    releaseYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    coverImagePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    ...commonOptions,
    indexes: [
      {
        unique: true,
        fields: ['title', 'artist_id'],
      },
    ],
  },
);

const Song = sequelize.define(
  'song',
  {
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },
    coverImagePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    audioFilePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    popularityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: 0,
        max: 100,
      },
    },
    moodTags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    language: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Spanish',
    },
    country: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Mexico',
    },
    playCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  commonOptions,
);

const Favorite = sequelize.define(
  'favorite',
  {},
  {
    ...commonOptions,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'song_id'],
      },
    ],
  },
);

const Playlist = sequelize.define(
  'playlist',
  {
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverImagePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  commonOptions,
);

const PlaylistSong = sequelize.define(
  'playlist_song',
  {
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    ...commonOptions,
    indexes: [
      {
        unique: true,
        fields: ['playlist_id', 'song_id'],
      },
    ],
  },
);

const History = sequelize.define(
  'history',
  {
    playedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    secondsPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  commonOptions,
);

const SearchHistory = sequelize.define(
  'search_history',
  {
    query: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    searchedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  commonOptions,
);

const UserGenre = sequelize.define(
  'user_genre',
  {},
  {
    ...commonOptions,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'genre_id'],
      },
    ],
  },
);

Role.hasMany(User);
User.belongsTo(Role);

User.belongsToMany(Genre, { through: UserGenre });
Genre.belongsToMany(User, { through: UserGenre });

Artist.hasMany(Album);
Album.belongsTo(Artist);

Artist.hasMany(Song);
Song.belongsTo(Artist);

Album.hasMany(Song);
Song.belongsTo(Album);

Genre.hasMany(Song);
Song.belongsTo(Genre);

User.belongsToMany(Song, { through: Favorite, as: 'favoriteSongs' });
Song.belongsToMany(User, { through: Favorite, as: 'likedByUsers' });
User.hasMany(Favorite);
Favorite.belongsTo(User);
Song.hasMany(Favorite);
Favorite.belongsTo(Song);

User.hasMany(Playlist);
Playlist.belongsTo(User);

Playlist.belongsToMany(Song, { through: PlaylistSong, as: 'songs' });
Song.belongsToMany(Playlist, { through: PlaylistSong, as: 'playlists' });
Playlist.hasMany(PlaylistSong);
PlaylistSong.belongsTo(Playlist);
Song.hasMany(PlaylistSong);
PlaylistSong.belongsTo(Song);

User.hasMany(History);
History.belongsTo(User);
Song.hasMany(History);
History.belongsTo(Song);

User.hasMany(SearchHistory);
SearchHistory.belongsTo(User);

const songIncludes = [
  { model: Artist },
  { model: Album, include: [{ model: Artist }] },
  { model: Genre },
];

module.exports = {
  sequelize,
  Op,
  Role,
  User,
  Genre,
  Artist,
  Album,
  Song,
  Favorite,
  Playlist,
  PlaylistSong,
  History,
  SearchHistory,
  UserGenre,
  songIncludes,
};
