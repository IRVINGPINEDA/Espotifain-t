const bcrypt = require('bcryptjs');
const env = require('../config/env');
const sequelize = require('../config/database');
const { ensureUploadDirs } = require('../config/multer');
const { createBaseSlug } = require('../utils/slug');
const { Genre, Role, User } = require('../models');

const defaultGenres = [
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

const seedDatabase = async () => {
  ensureUploadDirs();

  await sequelize.sync();

  const [adminRole] = await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: { name: 'admin' },
  });
  const [userRole] = await Role.findOrCreate({
    where: { name: 'user' },
    defaults: { name: 'user' },
  });

  await Promise.all(
    defaultGenres.map((name) =>
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

  const [adminUser, created] = await User.findOrCreate({
    where: { email: env.admin.email },
    defaults: {
      name: env.admin.name,
      email: env.admin.email,
      passwordHash: await bcrypt.hash(env.admin.password, 10),
      roleId: adminRole.id,
      isActive: true,
    },
  });

  if (!created && adminUser.roleId !== adminRole.id) {
    await adminUser.update({ roleId: adminRole.id });
  }

  console.log('Seed complete.');
  console.log(`Admin user: ${env.admin.email}`);
  console.log(`Default user role id: ${userRole.id}`);
};

seedDatabase()
  .then(async () => {
    await sequelize.close();
  })
  .catch(async (error) => {
    console.error('Failed to seed database:', error);
    await sequelize.close();
    process.exit(1);
  });
