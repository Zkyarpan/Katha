# Katha 📖

> *Stories that must not be forgotten.*

Katha is an AI-powered platform that preserves dying oral folk tales — the stories that live only in memory, passed down by grandparents, never written down. When the storyteller is gone, the story is gone. Katha changes that.

🔗 **Live demo:** [katha-lac.vercel.app](https://katha-lac.vercel.app)  
📂 **GitHub:** [github.com/Zkyarpan/Katha](https://github.com/Zkyarpan/Katha)

---

## The Problem

Thousands of oral folk tales are disappearing as elders pass away. These stories — mountain spirit legends, moral fables, origin myths — were never written down. When a grandparent dies without passing their story on, it vanishes from the world forever. This is a real, ongoing cultural loss happening in communities worldwide, including Nepal.

## The Solution

Katha lets anyone save a rough, imperfect retelling of a story they remember — by voice or by text. AI cleans it into polished writing, translates it, illustrates it, and reimagines it as a children's book or comic. The original storyteller's **actual voice** is preserved alongside the text. Stories can be linked to related variants across cultures, and exported as printable picture books.

A fading memory becomes a preserved, shareable, living creative work.

---

## Features

### Preservation
| Feature | Description |
|---|---|
| 📝 Save a story | Type or dictate a rough retelling — AI cleans it up |
| 🎙️ **Voice preservation** | The storyteller's actual audio is saved and playable — not just transcribed and discarded |
| 🌍 Any language in, any language out | Auto-detects the original language; readers can read any story in any language on demand |
| 🗺️ Origin map | Stories are geocoded and pinned on a world map |
| 🏷️ Auto-tagging | AI labels each story's theme |

### Reimagining
| Feature | Description |
|---|---|
| 🎨 AI cover art | Every story gets an AI-generated illustration |
| 📖 Illustrated children's book | Reimagines any story as a multi-page picture book, each page with its own AI illustration |
| 📄 **PDF export** | Download the illustrated book as a real, printable PDF |
| 🎭 Comic script | Reimagines any story as a panel-by-panel comic |
| 🔊 Read aloud | Reads the story in whichever language is selected |

### Community
| Feature | Description |
|---|---|
| 💬 Echoes | Readers share a related memory beneath any story |
| 🔗 **Story Chain** | Link a story to its variants — see how the same myth surfaces across different cultures |
| 📊 **Impact stats** | Live count of stories preserved, languages represented, and countries reached |
| 🔐 Auth | Sign in with Google, magic link, or fully anonymously |
| 🛡️ Admin panel | Moderate stories, echoes, and users |

---

## Challenge Theme

**July Challenge: Reimagine Creative Industries with AI**

---

## AI Architecture

All AI calls route through a single swappable function (`lib/watsonx.ts`), so the underlying model can be changed without touching the rest of the app.

| Task | Approach |
|---|---|
| Story cleanup, translation, tagging, reimagining | Pollinations AI text (OpenAI-compatible endpoint) |
| Cover art & per-page book illustrations | Pollinations AI image generation |
| Voice-to-text input | Browser Web Speech API |
| Voice audio preservation | Supabase Storage |
| Read aloud | Browser Speech Synthesis API |
| Geocoding | OpenStreetMap Nominatim |

---

## How IBM Bob Was Used

IBM Bob was the **primary development tool** throughout the entire build:

- Scaffolded the Next.js project structure and every API route
- Generated and debugged the Supabase schema, RLS policies, and auth triggers
- Built the full AI pipeline (cleanup, translation, tagging, reimagining, image generation)
- Implemented audio upload/playback with Supabase Storage
- Built the PDF export pipeline for illustrated books
- Wrote and iterated on every UI component
- Resolved Next.js App Router edge cases (Server Components, SSR, dynamic imports)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui + Magic UI |
| Database | Supabase (Postgres + Row Level Security) |
| Storage | Supabase Storage (voice recordings) |
| Auth | Supabase Auth (Google OAuth, Magic Link, Anonymous) |
| AI | Pollinations.ai (text + image) |
| Map | Leaflet + OpenStreetMap |
| Hosting | Vercel |
| Dev tool | **IBM Bob** |

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
