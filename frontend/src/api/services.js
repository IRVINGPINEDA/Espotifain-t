import client from './client';

const toFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

const unwrap = async (request) => {
  const { data } = await request;
  return data;
};

export const authApi = {
  login: (payload) => unwrap(client.post('/auth/login', payload)),
  register: (payload) => unwrap(client.post('/auth/register', payload)),
  me: () => unwrap(client.get('/auth/me')),
  getPreferenceGenres: () => unwrap(client.get('/auth/preferences')),
};

export const songsApi = {
  list: (params) => unwrap(client.get('/songs', { params })),
  details: (songId) => unwrap(client.get(`/songs/${songId}`)),
  play: (songId, payload = {}) => unwrap(client.post(`/songs/${songId}/play`, payload)),
  catalogOptions: () => unwrap(client.get('/songs/catalog/options')),
};

export const usersApi = {
  profile: () => unwrap(client.get('/users/me')),
  library: () => unwrap(client.get('/users/library')),
  favorites: () => unwrap(client.get('/users/favorites')),
  history: () => unwrap(client.get('/users/history')),
  toggleFavorite: (songId) => unwrap(client.post(`/users/favorites/${songId}`)),
  updatePreferences: (payload) => unwrap(client.patch('/users/preferences', payload)),
};

export const playlistsApi = {
  list: () => unwrap(client.get('/playlists')),
  create: (payload) => unwrap(client.post('/playlists', payload)),
  update: (playlistId, payload) => unwrap(client.put(`/playlists/${playlistId}`, payload)),
  remove: (playlistId) => unwrap(client.delete(`/playlists/${playlistId}`)),
  addSong: (playlistId, payload) => unwrap(client.post(`/playlists/${playlistId}/songs`, payload)),
  removeSong: (playlistId, songId) => unwrap(client.delete(`/playlists/${playlistId}/songs/${songId}`)),
};

export const searchApi = {
  search: (query) => unwrap(client.get('/search', { params: { q: query } })),
  recent: () => unwrap(client.get('/search/recent')),
};

export const recommendationsApi = {
  home: () => unwrap(client.get('/recommendations')),
  autoplay: (songId) => unwrap(client.get(`/recommendations/autoplay/${songId}`)),
};

export const adminApi = {
  dashboard: () => unwrap(client.get('/admin/dashboard')),
  catalog: () => unwrap(client.get('/admin/catalog')),
  users: () => unwrap(client.get('/admin/users')),
  updateUser: (userId, payload) => unwrap(client.patch(`/admin/users/${userId}`, payload)),
  createGenre: (payload) => unwrap(client.post('/admin/genres', payload)),
  createArtist: (payload) => unwrap(client.post('/admin/artists', toFormData(payload))),
  createAlbum: (payload) => unwrap(client.post('/admin/albums', toFormData(payload))),
  saveSong: (payload, songId = null) =>
    songId
      ? unwrap(client.put(`/admin/songs/${songId}`, toFormData(payload)))
      : unwrap(client.post('/admin/songs', toFormData(payload))),
  deleteSong: (songId) => unwrap(client.delete(`/admin/songs/${songId}`)),
};
