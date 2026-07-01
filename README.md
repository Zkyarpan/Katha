# Katha - Stories That Must Not Be Forgotten

A beautiful web application for preserving dying oral folk tales, built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Preserve Stories**: Share folk tales passed down through generations
- **Beautiful UI**: Warm, magical storybook aesthetic with deep indigo/plum gradients, gold accents, and smooth animations
- **Reimagine Tales**: Transform stories into children's books or comic scripts (AI integration ready)
- **Responsive Design**: Works beautifully on mobile and desktop devices

## 🎨 Design System

- **Colors**:
  - Background: Deep indigo to plum gradient (#22183D to #5C3678)
  - Accents: Warm gold (#F0B95C) and sunset orange (#DB7052)
  - Text: Cream (#F7EDD6)
- **Typography**: 
  - Headings: Playfair Display (serif)
  - Body: Inter (sans-serif)
- **Style**: Rounded corners, soft shadows, glow effects, smooth transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
katha/
├── app/
│   ├── page.tsx              # Home page with story grid
│   ├── new-story/
│   │   └── page.tsx          # Form to add new stories
│   ├── story/[id]/
│   │   └── page.tsx          # Story detail with reimagine options
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Button.tsx            # Reusable button component
│   ├── Header.tsx            # Navigation header
│   └── StoryCard.tsx         # Story card for grid display
├── public/                   # Static assets
└── tailwind.config.ts        # Tailwind configuration
```

## 🎯 Pages

### Home Page (`/`)
- Hero section with app title and tagline
- Grid of preserved stories with cover images
- "Add a Story" call-to-action button

### New Story Page (`/new-story`)
- Form to submit a new folk tale
- Fields: Story title, storyteller name, story content
- Beautiful centered form with storybook styling

### Story Detail Page (`/story/[id]`)
- Full-width cover image banner
- Complete story text in readable format
- "Reimagine" section with two options:
  - Children's Book version
  - Comic Script version

## 🔧 Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Playfair Display, Inter)

## 🎨 Components

### Button
Reusable button with primary/secondary variants, icon support, and smooth hover effects.

### Header
Sticky navigation header with logo and navigation links.

### StoryCard
Card component for displaying story previews with cover image, title, and storyteller.

## 📝 Current Status

**Frontend Complete** ✅
- All pages designed and implemented
- Responsive design working
- Mock data in place
- Beautiful UI with storybook aesthetic

**Next Steps** (Backend Integration):
- Connect to AI API for story cleanup
- Implement cover image generation
- Add database for story persistence
- Implement reimagine functionality with AI

## 🎭 Mock Data

Currently using placeholder data for demonstration:
- 4 sample stories on home page
- Mock story content on detail page
- Placeholder reimagined versions

## 📱 Responsive Design

The app is fully responsive and works beautifully on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1280px+)

## 🌙 Theme

The app features a warm, magical "storybook" aesthetic inspired by:
- Night sky with stars and moon
- Mountain silhouettes
- Cozy, premium feeling
- Soft glows and shadows
- Smooth animations and transitions

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with love for preserving cultural heritage and oral traditions.