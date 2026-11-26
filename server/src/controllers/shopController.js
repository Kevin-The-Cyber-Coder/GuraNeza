import Shop from '../models/Shop.js';
import { asyncHandler } from '../middleware/error.js';
import { ensureShopForSeller } from '../services/shops.js';
import { saveImage, removeImage } from '../services/storage.js';
import { slugify, httpError } from '../utils/text.js';
import { recordAudit } from '../services/audit.js';

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

export const getMyShop = asyncHandler(async (req, res) => {
  const shop = await ensureShopForSeller(req.user);
  res.json({ success: true, shop });
});

export const updateMyShop = asyncHandler(async (req, res) => {
  const shop = await ensureShopForSeller(req.user);
  const { name, description, phone, email, location } = req.body;

  if (name && name !== shop.name) {
    shop.name = name;
    shop.slug = await uniqueSlug(name, shop._id);
  }
  shop.description = description ?? shop.description;
  shop.phone = phone ?? shop.phone;
  shop.email = email ?? shop.email;
  shop.location = location ?? shop.location;
  await shop.save();

  await recordAudit({
    req,
    action: 'shop.updated',
    entityType: 'Shop',
    entityId: shop._id,
    metadata: { sellerId: req.user._id },
  });

  res.json({ success: true, message: 'Shop updated successfully', shop });
});

const uploadShopImage = async (req, res, field) => {
  if (!req.file) throw httpError(400, 'Please select an image to upload');
  const shop = await ensureShopForSeller(req.user);
  const saved = await saveImage(req.file, `shops/${shop._id}`);

  const previous = field === 'logo' ? shop.logo : shop.coverImage;
  if (previous) await removeImage(previous);

  if (field === 'logo') shop.logo = saved.url;
  else shop.coverImage = saved.url;
  await shop.save();

  await recordAudit({
    req,
    action: `shop.${field}_updated`,
    entityType: 'Shop',
    entityId: shop._id,
    metadata: { sellerId: req.user._id },
  });

  res.json({ success: true, message: 'Image uploaded successfully', shop, image: saved });
};

export const uploadLogo = asyncHandler(async (req, res) => uploadShopImage(req, res, 'logo'));
export const uploadCover = asyncHandler(async (req, res) => uploadShopImage(req, res, 'coverImage'));
