# WeatherOps

A weather dashboard built with React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query and Leaflet.
Pick a city (or click anywhere on the map) to see current conditions, a 48-hour forecast, an 8-day
forecast, extra details (UV, pressure, sunrise/sunset...) and air quality.

## Run it

Requires **Node.js 20.19+ or 22.12+** (Vite 7).

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173). **No API keys are needed.**

## API keys (optional)

| Without keys | With keys |
|---|---|
| Weather + air quality from [Open-Meteo](https://open-meteo.com/) (free, no signup) | Weather from OpenWeatherMap |
| Free dark basemap (CARTO / OpenStreetMap) | MapTiler `basic-dark` basemap |
| No weather overlay on the map | Cloud / rain / wind / temperature / pressure overlays |

To add keys: copy `.env.example` to `.env`, fill in the values, and **restart `npm run dev`**
(Vite reads `.env` only at startup).

- `VITE_WEATHER_API_KEY` - OpenWeatherMap key. The map overlays work with any valid key. Weather *data*
  uses the One Call 3.0 API, which needs its own subscription; if OpenWeatherMap rejects the request the
  app automatically falls back to Open-Meteo (a note is logged in the browser console).
- `VITE_MAPTILER_API_KEY` - MapTiler key (free tier).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

> Vite bakes `VITE_*` variables into the build. After changing `.env`, rebuild before deploying.

## How it's put together

```
src/
  api.ts                 OpenWeatherMap calls + automatic fallback to Open-Meteo
  config.ts              reads VITE_* keys, decides which provider is used
  providers/openMeteo.ts free provider, converted to the same shape as OpenWeatherMap
  schemas/               zod schemas that validate every API response
  components/            cards, map, side panel, dropdowns, skeletons
  components/QueryBoundary.tsx   shows an error card + "Try again" instead of a blank page
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| A card says "Couldn't load this data" | Read the message under it (network down, API limit...) and click **Try again** |
| "Weather map overlays need an OpenWeatherMap key" on the map | Expected without a key - add `VITE_WEATHER_API_KEY` to enable overlays |
| Added a key but nothing changed | Restart `npm run dev` - Vite only reads `.env` at startup |
| `npm install` fails on an old Node | Upgrade to Node 20.19+ / 22.12+ |
| Port 5173 is busy | Vite picks the next free port automatically; use the URL it prints |
