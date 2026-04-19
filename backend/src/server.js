const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');
const { ensureUploadDirs } = require('./config/multer');
const { Genre, Role, User } = require('./models');
const bcrypt = require('bcryptjs');
const { createBaseSlug } = require('./utils/slug');

const bootstrapDefaults = async () => {
  const [adminRole] = await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: { name: 'admin' },
  });
  const [userRole] = await Role.findOrCreate({
    where: { name: 'user' },
    defaults: { name: 'user' },
  });

  const genres = [
    'Regional Mexicano',
    'Reggaeton',
    'Pop Latino',
    'Banda',
    'Norteño',
    'Rock en Español',
    'Trap Latino',
    'Electrónica',
    'Rap / Hip-Hop',
    'Baladas Románticas',
  ];

  await Promise.all(
    genres.map((name) =>
      Genre.findOrCreate({
        where: { slug: createBaseSlug(name) },
        defaults: {
          name,
          slug: createBaseSlug(name),
          country: 'Mexico',
          description: `Featured preference option for ${name}.`,
          isFeatured: true,
        },
      }),
    ),
  );

  const [adminUser] = await User.findOrCreate({
    where: { email: env.admin.email },
    defaults: {
      name: env.admin.name,
      email: env.admin.email,
      passwordHash: await bcrypt.hash(env.admin.password, 10),
      roleId: adminRole.id,
      isActive: true,
    },
  });

  if (adminUser.roleId !== adminRole.id) {
    await adminUser.update({ roleId: adminRole.id });
  }

  return { adminRole, userRole };
};

const startServer = async () => {
  ensureUploadDirs();
  await sequelize.authenticate();

  if (env.initDbOnBoot) {
    await sequelize.sync();
  }

  if (env.seedOnBoot) {
    await bootstrapDefaults();
  }

  app.listen(env.port, () => {
    console.log(`Spotifyn´t backend listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
