import { OWM_KEY } from "./config";
import {
  getAirPollutionOpenMeteo,
  getGeoCodeOpenMeteo,
  getWeatherOpenMeteo,
} from "./providers/openMeteo";
import { AirPollutionSchema } from "./schemas/airPollutionSchema";
import { GeocodeSchema } from "./schemas/geocodeSchema";
import { weatherSchema } from "./schemas/weatherSchema";

type Position = { lat: number; long: number };

/** OpenWeather refused the request because of the key / plan / rate limit. */
class OwmAccessError extends Error {}

async function owmFetch(url: string): Promise<unknown> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403 || res.status === 429) {
    throw new OwmAccessError(
      data?.message ?? `OpenWeatherMap refused the request (${res.status})`
    );
  }
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }
  return data;
}

let warned = false;

/**
 * Use OpenWeatherMap when a key is configured. If OpenWeather rejects the key
 * (invalid, not activated yet, no One Call 3.0 subscription, quota used up),
 * quietly fall back to the free Open-Meteo API so the app keeps working.
 * With no key at all, Open-Meteo is used directly.
 */
async function withFallback<T>(
  openWeather: () => Promise<T>,
  openMeteo: () => Promise<T>
): Promise<T> {
  if (!OWM_KEY) return openMeteo();

  try {
    return await openWeather();
  } catch (error) {
    if (!(error instanceof OwmAccessError)) throw error;
    if (!warned) {
      warned = true;
      console.warn(
        `[WeatherOps] OpenWeatherMap said: "${error.message}". ` +
          `Falling back to Open-Meteo. (One Call 3.0 needs its own subscription: ` +
          `https://openweathermap.org/api/one-call-3)`
      );
    }
    return openMeteo();
  }
}

export function getWeather({ lat, long }: Position) {
  return withFallback(
    async () =>
      weatherSchema.parse(
        await owmFetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,alerts&units=metric&appid=${OWM_KEY}`
        )
      ),
    () => getWeatherOpenMeteo({ lat, long })
  );
}

export function getGeoCode(location: string) {
  return withFallback(
    async () =>
      GeocodeSchema.parse(
        await owmFetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OWM_KEY}`
        )
      ),
    () => getGeoCodeOpenMeteo(location)
  );
}

export function getAirPollution({ lat, long }: Position) {
  return withFallback(
    async () =>
      AirPollutionSchema.parse(
        await owmFetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${OWM_KEY}`
        )
      ),
    () => getAirPollutionOpenMeteo({ lat, long })
  );
}
