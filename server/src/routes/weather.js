import { Router } from 'express';
import { getWeather } from '../services/weather.js';

const router = Router();

/**
 * GET /api/weather/:location
 * Get current weather for a location
 */
router.get('/:location', async (req, res, next) => {
  try {
    const { location } = req.params;
    const weather = await getWeather(decodeURIComponent(location));
    res.json(weather);
  } catch (error) {
    next(error);
  }
});

export default router;
