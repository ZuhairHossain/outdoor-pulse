import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load and filter activities from the seed database
 */
let cachedActivities = null;

export function loadActivities() {
  if (cachedActivities) return cachedActivities;

  const dataPath = join(__dirname, '../data/activities.json');
  const raw = readFileSync(dataPath, 'utf-8');
  cachedActivities = JSON.parse(raw);
  return cachedActivities;
}

/**
 * Filter activities based on weather conditions, user preferences, and time
 */
export function filterActivities({ weather, userProfile, limit = 15 }) {
  const allActivities = loadActivities();
  const currentMonth = new Date().getMonth() + 1;
  const currentHour = new Date().getHours();

  let scored = allActivities.map(activity => {
    let score = 50; // Base score

    // Weather match
    const temp = weather?.temp_c;
    if (temp !== null && temp !== undefined) {
      const { min, max } = activity.weather_conditions.temp_range;
      if (temp >= min && temp <= max) {
        score += 20;
      } else {
        score -= 30;
      }
    }

    // Weather condition match
    const condition = (weather?.condition || '').toLowerCase();
    const idealConditions = activity.weather_conditions.ideal.map(c => c.toLowerCase());
    const avoidConditions = activity.weather_conditions.avoid.map(c => c.toLowerCase());

    if (idealConditions.some(c => condition.includes(c))) {
      score += 15;
    }
    if (avoidConditions.some(c => condition.includes(c))) {
      score -= 40;
    }

    // Seasonal match
    if (activity.seasonal.best_months.includes(currentMonth)) {
      score += 10;
    } else {
      score -= 10;
    }

    // User interest match
    const userInterests = (userProfile?.interests || []).map(i => i.toLowerCase());
    const activityTags = activity.tags.map(t => t.toLowerCase());
    const activityCategory = activity.category.toLowerCase();

    if (userInterests.includes(activityCategory)) {
      score += 25;
    }
    if (activityTags.some(tag => userInterests.includes(tag))) {
      score += 15;
    }

    // Fitness level match
    const fitnessMap = { beginner: 1, moderate: 2, active: 3, athletic: 4 };
    const userFitness = fitnessMap[userProfile?.fitness_level] || 2;
    const difficultyMap = { easy: 1, moderate: 2, challenging: 3 };
    const activityDifficulty = difficultyMap[activity.difficulty] || 2;

    if (activityDifficulty <= userFitness) {
      score += 10;
    } else {
      score -= 15;
    }

    // Duration fit
    const availableTime = userProfile?.available_time || 60;
    if (activity.duration_minutes.min <= availableTime) {
      score += 5;
    } else {
      score -= 20;
    }

    // Time of day bonus
    if (currentHour >= 5 && currentHour <= 9) {
      // Morning: boost hiking, birding, running
      if (['hiking', 'birding', 'running'].includes(activityCategory)) score += 10;
    } else if (currentHour >= 16 && currentHour <= 19) {
      // Golden hour: boost photography, scenic
      if (['photography', 'scenic'].includes(activityCategory)) score += 10;
    } else if (currentHour >= 20) {
      // Night: boost stargazing, night walks
      if (activityTags.includes('night') || activityTags.includes('stargazing')) score += 20;
    }

    return { ...activity, score: Math.max(0, Math.min(100, score)) };
  });

  // Sort by score and return top activities
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Get all activities grouped by category
 */
export function getActivitiesByCategory() {
  const activities = loadActivities();
  const grouped = {};

  for (const activity of activities) {
    if (!grouped[activity.category]) {
      grouped[activity.category] = [];
    }
    grouped[activity.category].push(activity);
  }

  return grouped;
}
