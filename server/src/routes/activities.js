import { Router } from 'express';
import { loadActivities, getActivitiesByCategory } from '../services/activities.js';

const router = Router();

/**
 * GET /api/activities
 * Browse all activities, optionally filtered by category
 */
router.get('/', (req, res) => {
  const { category } = req.query;
  const activities = loadActivities();

  if (category) {
    const filtered = activities.filter(
      a => a.category.toLowerCase() === category.toLowerCase()
    );
    return res.json({ activities: filtered, total: filtered.length });
  }

  res.json({ activities, total: activities.length });
});

/**
 * GET /api/activities/categories
 * Get activities grouped by category
 */
router.get('/categories', (req, res) => {
  const grouped = getActivitiesByCategory();
  const summary = Object.entries(grouped).map(([category, items]) => ({
    category,
    count: items.length,
    activities: items.map(a => a.name),
  }));

  res.json({ categories: summary });
});

export default router;
