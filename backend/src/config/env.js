const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT || process.env.APP_PORT, 5000),
  apiUrl: process.env.API_URL || 'http://localhost',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost,http://localhost:80')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || 'mysql',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'spotifynt',
    password: process.env.DB_PASSWORD || 'spotifynt',
    name: process.env.DB_NAME || 'spotifynt',
    logging: process.env.DB_LOGGING === 'true',
  },
  uploadRoot: process.env.UPLOAD_ROOT || path.resolve(process.cwd(), '../uploads'),
  authRateLimitMax: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 10),
  apiRateLimitMax: toNumber(process.env.API_RATE_LIMIT_MAX, 200),
  seedOnBoot: process.env.SEED_ON_BOOT !== 'false',
  initDbOnBoot: process.env.INIT_DB_ON_BOOT !== 'false',
  admin: {
    name: process.env.ADMIN_NAME || 'Platform Admin',
    email: process.env.ADMIN_EMAIL || 'admin@spotifynt.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
};

module.exports = env;
