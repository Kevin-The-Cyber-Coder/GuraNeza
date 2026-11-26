import Shop from '../models/Shop.js';
import { slugify } from '../utils/text.js';

const uniqueSlug = async (base, excludeId) => {
  const clean = slugify(base) || 'shop';
  let slug = clean;
  let i = 1;
  while (await Shop.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    i += 1;
    slug = `${clean}-${i}`;
  }
  return slug;
};

export const ensureShopForSeller = async (seller) => {
  const existing = await Shop.findOne({ owner: seller._id });
  if (existing) return existing;

  const name = seller.name ? `${seller.name}'s Shop` : 'My Shop';
  const slug = await uniqueSlug(name);
  try {
    return await Shop.create({
      owner: seller._id,
      name,
      slug,
      email: seller.email || '',
      phone: seller.phone || '',
      location: seller.address || '',
      status: 'active',
    });
  } catch (error) {
    if (error.code === 11000) {
      const shop = await Shop.findOne({ owner: seller._id });
      if (shop) return shop;
    }
    throw error;
  }
};
