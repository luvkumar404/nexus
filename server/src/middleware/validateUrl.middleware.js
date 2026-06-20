import { assertPublicUrl } from '../utils/normalizeUrl.js';

export async function validateUrl(req, res, next) {
  try {
    req.normalizedUrl = await assertPublicUrl(req.body.url);
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
