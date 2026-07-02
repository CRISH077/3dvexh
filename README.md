# Asme

Full-screen cinematic hero with a looping background video, liquid-glass UI, and a subtle three.js ambient particle layer.

Stack: Vite + React 18 + TypeScript + Tailwind CSS + three.js + lucide-react.

## Setup (Termux)

1. Extract this zip, then `cd` into the folder.
2. `npm install`
3. `npm run dev` — opens a local dev server. In Termux, open the printed `http://localhost:5173` link in Chrome on the same phone.
4. To ship it: `npm run build` produces a `dist/` folder — deploy that to Vercel/Netlify.

Your video is already placed at `public/bg.mp4` and wired up as the background — no extra config needed.
