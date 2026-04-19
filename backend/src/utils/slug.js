const slugify = require('slugify');
const { Op } = require('../models');

const createBaseSlug = (value) =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

const generateUniqueSlug = async (Model, value, excludeId = null) => {
  const baseSlug = createBaseSlug(value) || `item-${Date.now()}`;
  let candidate = baseSlug;
  let index = 1;

  while (true) {
    const existing = await Model.findOne({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
};

module.exports = {
  createBaseSlug,
  generateUniqueSlug,
};
