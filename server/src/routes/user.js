import { Router } from 'express';

const router = Router();

// In-memory user store (replace with MongoDB in production)
const users = new Map();

/**
 * POST /api/user/profile
 * Create or update user profile
 */
router.post('/profile', (req, res) => {
  const { id = 'default', name, interests, fitness_level, available_time, location } = req.body;

  const existing = users.get(id) || {};
  const profile = {
    ...existing,
    id,
    name: name || existing.name || 'Explorer',
    interests: interests || existing.interests || [],
    fitness_level: fitness_level || existing.fitness_level || 'moderate',
    available_time: available_time || existing.available_time || 60,
    location: location || existing.location || null,
    updated_at: new Date().toISOString(),
    created_at: existing.created_at || new Date().toISOString(),
  };

  users.set(id, profile);
  res.json(profile);
});

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', (req, res) => {
  const { id = 'default' } = req.query;
  const profile = users.get(id);

  if (!profile) {
    return res.json(null);
  }

  res.json(profile);
});

/**
 * POST /api/user/history
 * Log a completed activity
 */
router.post('/history', (req, res) => {
  const { id = 'default', activity_name, location, rating, notes } = req.body;

  const profile = users.get(id);
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!profile.history) profile.history = [];
  
  profile.history.push({
    activity_name,
    location,
    rating,
    notes,
    date: new Date().toISOString(),
  });

  users.set(id, profile);
  res.json({ success: true, history: profile.history });
});

/**
 * GET /api/user/history
 * Get activity history
 */
router.get('/history', (req, res) => {
  const { id = 'default' } = req.query;
  const profile = users.get(id);

  if (!profile) {
    return res.json({ history: [] });
  }

  res.json({ history: profile.history || [] });
});

export default router;
