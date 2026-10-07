import { Router } from 'express';
import { getWeather, getSeasonalInfo } from '../services/weather.js';
import { filterActivities } from '../services/activities.js';
import { generateRecommendations } from '../services/gemma.js';

const router = Router();

/**
 * GET /api/recommend
 * Generate personalized outdoor activity recommendations
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      location = 'Dhaka, Bangladesh',
      lat,
      lng,
      interests,
      fitness_level = 'moderate',
      available_time = 60,
      name = 'Explorer',
    } = req.query;

    const locationStr = location || (lat && lng ? `${lat},${lng}` : 'Dhaka, Bangladesh');

    // Step 1: Get current weather
    const weather = await getWeather(locationStr);

    // Step 2: Build user profile from query params
    const userProfile = {
      name,
      interests: interests ? interests.split(',') : ['hiking', 'nature', 'photography'],
      fitness_level,
      available_time: parseInt(available_time) || 60,
    };

    // Step 3: Filter activities by weather & preferences
    const filteredActivities = filterActivities({
      weather,
      userProfile,
      limit: 12,
    });

    // Step 4: Generate AI recommendations using Gemma
    let aiRecommendations;
    try {
      aiRecommendations = await generateRecommendations({
        weather,
        userProfile,
        activities: filteredActivities,
        location: locationStr,
      });
    } catch (aiError) {
      console.error('AI generation failed, using filtered results:', aiError.message);
      // Fallback: return pre-filtered activities without AI enhancement
      aiRecommendations = {
        greeting: `Hey ${name}! Here are some great outdoor activities for you right now.`,
        recommendations: filteredActivities.slice(0, 5).map(a => ({
          activity_name: a.name,
          headline: a.description.slice(0, 80) + '...',
          description: a.description,
          why_now: `The weather looks good for ${a.category} activities.`,
          difficulty: a.difficulty,
          duration: `${a.duration_minutes.min}-${a.duration_minutes.max} minutes`,
          what_to_bring: a.equipment.slice(0, 3),
          what_to_wear: 'Comfortable outdoor clothing',
          best_time_window: 'The next few hours',
          category: a.category,
          match_score: a.score,
        })),
        weather_note: `Current conditions: ${weather.condition}, ${weather.temp_c}°C`,
      };
    }

    // Step 5: Get seasonal info (non-blocking)
    const seasonalInfo = await getSeasonalInfo(locationStr).catch(() => null);

    res.json({
      ...aiRecommendations,
      weather,
      seasonal_info: seasonalInfo,
      generated_at: new Date().toISOString(),
      model: aiRecommendations._model || 'open-weight',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
