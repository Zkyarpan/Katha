# Katha 📖

> *Stories that must not be forgotten.*

Katha is an AI-powered platform that preserves dying oral folk tales — the stories that live only in memory, passed down by grandparents, never written down. When the storyteller is gone, the story is gone. Katha changes that.

🔗 **Live demo:** [katha-lac.vercel.app](https://katha-lac.vercel.app)  
📂 **GitHub:** [github.com/Zkyarpan/Katha](https://github.com/Zkyarpan/Katha)

---

## The Problem

Thousands of oral folk tales are disappearing as elders pass away. These stories — mountain spirit legends, moral fables, origin myths — were never written down. When a grandparent dies without passing their story on, it vanishes from the world forever. This is a real, ongoing cultural loss happening in communities worldwide, including Nepal.

## The Solution

Katha lets anyone save a rough, imperfect retelling of a story they remember. AI cleans it into polished writing, translates it, illustrates it with a generated cover image, and reimagines it as a children's book or comic script — turning a fading memory into a preserved, shareable creative work.

---

## Features

| Feature | Description |
|---|---|
| 📝 Save a story | Type or dictate a rough retelling — AI cleans it up |
| 🌍 Multi-language | Auto-detects original language; readers can read in any language on demand |
| 🎨 AI cover art | Every story gets an AI-generated cover illustration |
| 🗺️ Origin map | Stories are geocoded and pinned on a world map |
| 🏷️ Auto-tagging | AI labels each story's theme (e.g. "Mountain Spirit", "Trickster Tale") |
| 📖 Children's Book | Reimagines stories as illustrated multi-page picture books |
| 🎭 Comic Script | Reimagines stories as panel-by-panel comic scripts |
| 🔊 Read Aloud | Reads the story aloud in the selected language |
| 🎙️ Voice input | Dictate stories by voice instead of typing |
| 💬 Echoes | Readers share related memories on each story |
| 🔐 Auth | Sign in with Google, magic link, or anonymously |
| 🛡️ Admin panel | Manage stories, echoes, and users |

---

## Challenge Theme

**July Challenge: Reimagine Creative Industries with AI**

---

## AI Architecture

All AI calls go through a single swappable function (`lib/watsonx.ts`) so the underlying model can be changed without touching the rest of the app.

| Task | Model |
|---|---|
| Story cleanup, translation, tagging, reimagining | Pollinations AI text (OpenAI-compatible, prompted for IBM Granite-style instruction following) |
| Cover & book illustrations | Pollinations AI image generation |
| Voice input & Read Aloud | Browser Web Speech API |

---

## How IBM Bob Was Used

IBM Bob was the **primary development tool** throughout the entire build:

- Scaffolded the Next.js project structure and all API routes
- Generated and debugged Supabase database schema and RLS policies
- Built the AI integration pipeline (text cleanup, translation, reimagine API routes)
- Wrote and fixed UI components (StoryCard, EchoesSection, AdminTables, PictureBook)
- Resolved Next.js App Router-specific issues (Server Components, SSR, dynamic imports)
- Iterated on the UI redesign with shadcn/ui and Magic UI components

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui + Magic UI |
| Database | Supabase (Postgres + Row Level Security) |
| Auth | Supabase Auth (Google OAuth, Magic Link, Anonymous) |
| AI (text) | Pollinations.ai (OpenAI-compatible endpoint) |
| AI (images) | Pollinations.ai image generation |
| Map | Leaflet + OpenStreetMap + CartoDB tiles |
| Hosting | Vercel |
| Dev tool | IBM Bob |

---

## Getting Started

```bash
git clone https://github.com/Zkyarpan/Katha.git
cd Katha
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
POLLINATIONS_API_KEY=your_pollinations_key
```

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Team

**Arpan Karki** & **Darsan Khanal**  
Computer Science Students

---

*Built for the IBM AI Builders Challenge — July 2026*
