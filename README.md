# ARIA (Automated Rescue & Intervention Assistant) 🚑

ARIA is an AI-driven multimodal emergency medical triage assistant designed for high-stakes incidents. It leverages the latest **Google Gemini 2.0 Flash** models to provide near-instantaneous, streaming analysis of emergency signals (voice, text, images, or medical documents).

## 🚀 Key Features

- **Multimodal Triage:** Real-time analysis of emergency audio (WAV/WebM), images (PNG/JPEG), PDFs, and text signals.
- **Smart Directions:** One-tap contextual navigation to the 5 nearest medical facilities found via the **Google Places API**.
- **Interactive Map:** Live GPS tracking with auto-bounds for both the caller and recommended resources.
- **Resilient Reliability:** Automated fallback to **GPT-4o** ensure zero-downtime during peak triage periods or API quotas.
- **Accessible Design:** Strict ARIA implementation and semantic HTML for screen-reader and keyboard accessibility.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Framer Motion, Shaden/UI.
- **Maps:** `@vis.gl/react-google-maps`, Google Places API.
- **AI Integration:** `@google/genai` (Gemini 2.0 Flash) & `OpenAI` (Fallback).
- **Deployment:** Docker (Standalone production build), Next.js Edge Runtime.

## 📦 Getting Started

### Environment Variables

Create a `.env.local` file with the following keys:

- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `FALL_BACK_OPENAI`: (Optional) Your OpenAI API key for redundancy.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API key.

### Installation

```bash
npm install
npm run dev
```

## 🏗️ Docker Build

To build the production-ready image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here \
  -t aria-triage .
```

## 📊 Evaluation Criteria Applied

- **Code Quality:** Strict TypeScript mode, module-level scoping.
- **Security:** Server-side MIME allowlist and size validation.
- **Efficiency:** Edge runtime execution and SSE streaming.
- **Accessibility:** `sr-only` labels, ARIA-live regions, and descriptive buttons.
- **Google Services:** Dual usage of Gemini and Maps/Places integration.

---
## Project Attribution
