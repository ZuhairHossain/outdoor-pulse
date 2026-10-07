import axios from 'axios';

/**
 * Generate audio narration of an activity recommendation using ElevenLabs TTS
 */
export async function generateAudio(text, voiceId = 'pNInz6obpgDQGcFmaJgB') {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    return {
      audio: Buffer.from(response.data),
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error.message);
    throw new Error('Failed to generate audio: ' + error.message);
  }
}

/**
 * Build a natural narration script from a recommendation
 */
export function buildNarrationScript(recommendation) {
  const parts = [
    `Here's a great activity for you: ${recommendation.activity_name}.`,
    recommendation.headline,
    recommendation.description,
    `This is rated ${recommendation.difficulty} difficulty, and should take about ${recommendation.duration}.`,
    recommendation.why_now,
  ];

  if (recommendation.what_to_bring?.length > 0) {
    parts.push(`You'll want to bring: ${recommendation.what_to_bring.join(', ')}.`);
  }

  if (recommendation.what_to_wear) {
    parts.push(`For clothing, ${recommendation.what_to_wear}.`);
  }

  if (recommendation.best_time_window) {
    parts.push(`Best time window: ${recommendation.best_time_window}.`);
  }

  return parts.join(' ');
}
