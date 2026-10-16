// Central place for environment configuration.
// Keys are optional: with no OpenWeatherMap key the app uses the free Open-Meteo API.

const clean = (value: string | undefined) => {
  const v = value?.trim();
  // ignore empty values and the placeholder from .env.example
  return v && !v.startsWith("your_") ? v : undefined;
};

export const OWM_KEY = clean(import.meta.env.VITE_WEATHER_API_KEY);
export const MAPTILER_KEY = clean(import.meta.env.VITE_MAPTILER_API_KEY);

/** true when weather data comes from Open-Meteo instead of OpenWeatherMap */
export const USING_FREE_PROVIDER = !OWM_KEY;
