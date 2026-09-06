import { Router } from 'express';
import { z } from 'zod';
import { getRepo } from '../db/index.js';
import { asyncHandler } from '../lib/http.js';

const router = Router();

/** GET /api/notifications?location=landing|sales — shuffled social-proof feed. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const location = z
      .enum(['landing', 'sales'])
      .catch('landing')
      .parse(req.query.location);
    const rows = await getRepo().listNotifications(location);
    // weighted shuffle
    const pool = rows.flatMap((r) => Array(Math.max(1, r.weight)).fill(r));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const seen = new Set<string>();
    const items = pool
      .filter((r) => (seen.has(r.id) ? false : seen.add(r.id)))
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        label: r.member_label,
        message: r.message,
        time: r.relative_time_text,
      }));
    res.json({ items });
  }),
);

export default router;
