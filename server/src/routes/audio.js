import { Router } from 'express';
import { generateAudio, buildNarrationScript } from '../services/elevenlabs.js';

const router = Router();

/**
 * POST /api/audio/generate
 * Generate audio narration for an activity recommendation
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { recommendation } = req.body;

    if (!recommendation) {
      return res.status(400).json({ error: 'Recommendation object is required' });
    }

    // Build narration text from the recommendation
    const narrationText = buildNarrationScript(recommendation);

    // Generate audio using ElevenLabs
    const { audio, contentType } = await generateAudio(narrationText);

    // Send audio as response
    res.set({
      'Content-Type': contentType,
      'Content-Length': audio.length,
      'Content-Disposition': `inline; filename="${recommendation.activity_name.replace(/\s+/g, '_')}.mp3"`,
    });

    res.send(audio);
  } catch (error) {
    if (error.message.includes('not configured')) {
      return res.status(503).json({ 
        error: 'Audio generation is not configured. Set ELEVENLABS_API_KEY.',
        available: false,
      });
    }
    next(error);
  }
});

/**
 * GET /api/audio/status
 * Check if ElevenLabs is configured
 */
router.get('/status', (req, res) => {
  res.json({
    available: !!process.env.ELEVENLABS_API_KEY,
  });
});

export default router;
