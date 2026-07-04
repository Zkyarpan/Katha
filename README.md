# Katha 📖

**Stories that must not be forgotten.**

Katha preserves dying oral folk tales — the ones only living in memory, passed down by grandparents, never written down. It uses AI to clean them up, translate them, illustrate them, and reimagine them as children's books, comics, and more.

🔗 **Live demo:** [katha-lac.vercel.app](https://katha-lac.vercel.app)

---

## The Problem

Thousands of oral folk tales are disappearing as elders pass away. When a story lives only in memory, losing the storyteller means losing the story forever — a real, ongoing loss of cultural heritage happening in communities worldwide, including Nepal.

## The Solution

Katha lets anyone record or write down a fading story before it's lost. AI cleans it into a polished narrative, detects and translates the original language, generates a cover illustration, and reimagines the tale as a new creative format — turning preserved memory into new creative work for the next generation.

---

## Features

- 📝 **Save a story** — type or speak a rough retelling; AI cleans it up
- 🌍 **Any language in, any language out** — auto-detects the original language, and lets readers translate the story into any language on demand
- 🎨 **AI-generated cover art** for every story
- 🗺️ **Origin map** — see where each story comes from
- 🏷️ **Auto-tagging** — AI labels each story's theme
- 🔊 **Read Aloud** in the selected language
- ✨ **Reimagine** — turn any story into an illustrated multi-page children's book or a comic script
- 🎙️ **Voice input** — dictate a story instead of typing

---

## AI Approach & Architecture

| Layer | Tool |
|---|---|
| Story cleanup, translation, tagging, reimagining | **AI text generation** (prompted the way IBM Granite is used, run via a swappable model layer in `lib/watsonx.ts`) |
| Cover & book illustrations | Pollinations.ai image generation |
| Voice input & Read Aloud | Browser Web Speech API |
| Database | Supabase (Postgres) |
| Hosting | Vercel |
| Development | **IBM Bob** (primary dev tool — see below) |

All AI calls go through one function, `askGranite()`, so the underlying model is swappable without touching the rest of the app.

## Challenge Theme

**July Challenge: Reimagine Creative Industries with AI**

## How IBM Bob Was Used

IBM Bob was used as the primary development tool throughout the build: scaffolding the Next.js project and component structure, writing and debugging API routes (story cleanup, translation, reimagine), fixing integration issues between the frontend and Supabase/AI services, and iterating on UI components.

---

## Tech Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Supabase · Pollinations.ai · Leaflet · Vercel · IBM Bob

## Getting Started Locally

```bash
git clone https://github.com/Zkyarpan/Katha.git
cd Katha
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
POLLINATIONS_API_KEY=your_pollinations_key
```

```bash
npm run dev
```

---

## Team

Arpan Karki & Darsan Khanal

*Built for the IBM AI Builders Challenge with IBM Bob — July 2026*
