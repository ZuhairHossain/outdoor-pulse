# 🌿 OutdoorPulse

**AI-powered outdoor activity recommender that gets you off the screen and into the world.**

OutdoorPulse uses open-weight AI models to analyze real-time weather, your preferences, and time of day to suggest personalized outdoor activities — with voice narration to listen to while you get ready.

> Built for [Hacktoberfest 2026 — Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest2026)

---

## ✨ Features

- 🤖 **AI Recommendations** — Gemma 4 (open-weight) generates personalized activity suggestions based on real conditions
- 🌤️ **Live Weather** — SerpApi fetches current weather, UV index, humidity, and sunrise/sunset times
- 🔊 **Voice Narration** — ElevenLabs reads recommendations aloud so you can listen while getting ready
- 📍 **Location Aware** — GPS auto-detection or manual entry for any city worldwide
- 👤 **Personal Profiles** — Set your interests, fitness level, and available time
- 🌙 **Time-Aware** — Suggestions adapt to morning, afternoon, evening, or night
- 🎨 **Premium Dark UI** — Glassmorphism design with nature-inspired color palette

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────────────┐
│   Vite + React  │────▶│       Express API Server      │
│   (Frontend)    │     │                                │
│                 │     │  ┌──────────┐  ┌────────────┐ │
│  • Profile      │     │  │ SerpApi  │  │ Gemma 4    │ │
│  • Weather      │     │  │ Weather  │──│ via        │ │
│  • Activities   │     │  │          │  │ OpenRouter │ │
│  • Audio Player │     │  └──────────┘  └────────────┘ │
│                 │     │  ┌──────────────────────────┐ │
│                 │     │  │    ElevenLabs TTS        │ │
│                 │     │  │    Voice Narration       │ │
│                 │     │  └──────────────────────────┘ │
└─────────────────┘     └──────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- API keys (all free tiers):
  - [OpenRouter](https://openrouter.ai) — Gemma 4 inference (free)
  - [SerpApi](https://serpapi.com) — Weather data (100 free searches/month)
  - [ElevenLabs](https://elevenlabs.io) — Voice narration (free tier)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/outdoor-pulse.git
cd outdoor-pulse

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Install & run backend
cd server && npm install && npm run dev

# In another terminal — install & run frontend
cd client && npm install && npm run dev
```

Open http://localhost:5173 in your browser.

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ | Free API key from OpenRouter (runs Gemma 4) |
| `GROQ_API_KEY` | Fallback | Free API key from Groq (runs Qwen 3.8) |
| `SERPAPI_API_KEY` | ✅ | Weather data from SerpApi |
| `ELEVENLABS_API_KEY` | Optional | Voice narration (starts with `sk_`) |
| `SENTRY_DSN` | Optional | Error tracking via Sentry |
| `PORT` | Optional | Server port (default: 3001) |

## 🧠 Why Open-Source AI?

OutdoorPulse runs on **Gemma 4** — Google's open-weight model — via OpenRouter's free inference tier. This means:

- **No vendor lock-in** — Swap models freely (Gemma ↔ Qwen ↔ Llama)
- **Privacy first** — Your location and preferences don't feed a proprietary training pipeline
- **Zero cost** — Free API tiers make this accessible to everyone
- **Transparent** — Open weights mean you can inspect exactly how the AI reasons
- **Resilient** — Multi-provider fallback ensures the app always works

## 📦 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Vite + React | Fast builds, modern DX |
| Backend | Express.js | Lightweight, ESM-native |
| AI | Gemma 4 (OpenRouter) | Open-weight, free inference |
| Weather | SerpApi | Reliable, structured data |
| Audio | ElevenLabs | Natural-sounding TTS |
| Hosting | Render | Free tier, auto-deploy |

## 📄 License

MIT — see [LICENSE](./LICENSE)
