import { AirPollutionSchema } from "./schemas/airPollutionSchema";
import { GeocodeSchema } from "./schemas/geocodeSchema";
import { weatherSchema } from "./schemas/weatherSchema";

const API_key = import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather({ lat, long }: { lat: number; long: number }) {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,alerts&units=metric&appid=${API_key}`
  );

  const data = await res.json();
  return weatherSchema.parse(data);
}

export async function getGeoCode(location: string) {
  const res = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_key}`
  );

  const data = await res.json();
  return GeocodeSchema.parse(data);
}

export async function getAirPollution({ lat, long }: { lat: number; long: number }) {
  const res = await fetch(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${API_key}`
  );

  const data = await res.json();
  return AirPollutionSchema.parse(data);
}