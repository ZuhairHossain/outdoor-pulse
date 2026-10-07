import Groq from 'groq-sdk';
import axios from 'axios';

// Model configuration — tries providers in order
const PROVIDERS = [
  {
    id: 'openrouter-gemma',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'google/gemma-4-31b-it:free',
    keyEnv: 'OPENROUTER_API_KEY',
    name: 'Gemma 4 31B (via OpenRouter)',
    useFetch: true,
  },
  {
    id: 'groq',
    model: 'qwen/qwen3.8-27b',
    keyEnv: 'GROQ_API_KEY',
    name: 'Qwen 3.8 27B (via Groq)',
    useFetch: false,
  },
];

/**
 * Try calling OpenRouter with raw fetch (avoids SDK URL issues)
 */
async function callOpenRouter(apiKey, model, messages) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://outdoor-pulse.onrender.com',
        'X-Title': 'OutdoorPulse',
      },
      timeout: 60000,
    }
  );
  return response.data;
}

/**
 * Try calling Groq with native SDK
 */
async function callGroq(apiKey, model, messages) {
  const groq = new Groq({ apiKey });
  return groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });
}

/**
 * Generate personalized outdoor activity recommendations using open-weight models.
 * Primary: Gemma 4 via OpenRouter (free, open-weight, prize-eligible)
 * Fallback: Qwen 3.8 via Groq (free, open-weight)
 */
export async function generateRecommendations({ weather, userProfile, activities, location }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 6 ? 'pre-dawn' :
    currentHour < 10 ? 'morning' :
    currentHour < 14 ? 'midday' :
    currentHour < 17 ? 'afternoon' :
    currentHour < 20 ? 'evening' : 'night';

  const prompt = `You are OutdoorPulse, an AI outdoor activity recommender. Your job is to suggest the BEST outdoor activities for RIGHT NOW based on current conditions.

CURRENT CONDITIONS:
- Location: ${location || 'Unknown'}
- Weather: ${weather?.condition || 'Unknown'}, ${weather?.temp_c ?? '?'}°C (feels like ${weather?.feelslike_c ?? '?'}°C)
- Wind: ${weather?.wind_kph ?? '?'} km/h
- Humidity: ${weather?.humidity ?? '?'}%
- UV Index: ${weather?.uv ?? '?'}
- Sunrise: ${weather?.sunrise || '?'}, Sunset: ${weather?.sunset || '?'}
- Time of day: ${timeOfDay} (current hour: ${currentHour})
- Month: ${currentMonth}

USER PROFILE:
- Interests: ${userProfile?.interests?.join(', ') || 'general outdoor activities'}
- Fitness level: ${userProfile?.fitness_level || 'moderate'}
- Available time: ${userProfile?.available_time || 60} minutes
- Name: ${userProfile?.name || 'Outdoor enthusiast'}

AVAILABLE ACTIVITIES:
${activities.map(a => `- ${a.name} (${a.category}, ${a.difficulty}, ${a.duration_minutes.min}-${a.duration_minutes.max}min): ${a.description}`).join('\n')}

INSTRUCTIONS:
1. Select 3-5 activities that are BEST suited for the current weather, time of day, season, and user preferences.
2. For each activity, provide a personalized recommendation explaining WHY now is a great time for it.
3. Include practical tips: what to bring, what to wear, best nearby spots if possible.
4. Be specific and enthusiastic — not generic. Reference the actual weather data.
5. If weather is poor for outdoor activities, suggest the few that still work (like rainy day walks) and be honest about conditions.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences, no thinking tags, no extra text):
{
  "greeting": "A warm, personalized 1-sentence greeting mentioning the weather and time of day",
  "recommendations": [
    {
      "activity_name": "Exact name from the available activities list",
      "headline": "An exciting, specific one-liner about why NOW is perfect for this",
      "description": "2-3 sentences of personalized advice. Be specific about conditions.",
      "why_now": "One sentence explaining what makes right now ideal",
      "difficulty": "easy|moderate|challenging",
      "duration": "Suggested duration range like '20-30 minutes'",
      "what_to_bring": ["item1", "item2", "item3"],
      "what_to_wear": "Brief weather-appropriate clothing suggestion",
      "best_time_window": "e.g., 'Next 2 hours' or 'Before sunset at 5:30 PM'",
      "category": "The activity category",
      "match_score": 85
    }
  ],
  "weather_note": "One sentence about overall outdoor conditions right now"
}`;

  const messages = [
    {
      role: 'system',
      content: 'You are an expert outdoor activity recommender. Always respond with valid JSON only. No markdown fences, no thinking tags, no extra text.',
    },
    { role: 'user', content: prompt },
  ];

  // Try each provider in order
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.keyEnv];
    if (!apiKey) continue;

    try {
      console.log(`🤖 Trying ${provider.name}...`);

      let completion;
      if (provider.useFetch) {
        completion = await callOpenRouter(apiKey, provider.model, messages);
      } else {
        completion = await callGroq(apiKey, provider.model, messages);
      }

      const text = completion.choices?.[0]?.message?.content || '';

      // Clean and parse response
      let cleaned = text.trim();
      cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      parsed._model = provider.name;
      parsed._provider = provider.id;

      console.log(`✅ ${provider.name} succeeded!`);
      return parsed;
    } catch (error) {
      const msg = error?.response?.data?.error?.message || error.message || 'Unknown error';
      console.warn(`⚠️ ${provider.name} failed: ${msg.slice(0, 100)}`);
      // Continue to next provider
    }
  }

  throw new Error('All AI providers failed. Please try again shortly.');
}
