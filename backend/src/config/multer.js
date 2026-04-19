const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('./env');

const coverDir = path.join(env.uploadRoot, 'covers');
const audioDir = path.join(env.uploadRoot, 'audio');

const ensureUploadDirs = () => {
  fs.mkdirSync(coverDir, { recursive: true });
  fs.mkdirSync(audioDir, { recursive: true });
};

ensureUploadDirs();

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = imageMimeTypes.includes(file.mimetype) ? coverDir : audioDir;
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if ([...imageMimeTypes, ...audioMimeTypes].includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

const normalizeUploadPath = (absolutePath) => {
  const relative = path.relative(env.uploadRoot, absolutePath).replace(/\\/g, '/');
  return `/uploads/${relative}`;
};

const removeUpload = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) {
    return;
  }

  const absolutePath = path.join(env.uploadRoot, publicPath.replace('/uploads/', '').replace(/\//g, path.sep));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

module.exports = {
  audioDir,
  coverDir,
  ensureUploadDirs,
  normalizeUploadPath,
  removeUpload,
  upload,
};
