// Free, key-less weather provider (https://open-meteo.com, CC BY 4.0).
// Everything is converted into the same shapes the app already uses for
// OpenWeatherMap (see src/schemas) so no UI component has to know the difference.

import { AirPollutionSchema } from "../schemas/airPollutionSchema";
import { GeocodeSchema } from "../schemas/geocodeSchema";
import { weatherSchema } from "../schemas/weatherSchema";

type Num = number | null | undefined;

const num = (v: Num, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/* -------------------------------------------------------------------------- */
/*  WMO weather code  ->  OpenWeather-style condition (id, main, text, icon)   */
/* -------------------------------------------------------------------------- */

type Condition = [id: number, main: string, description: string, icon: string];

const WMO: Record<number, Condition> = {
  0: [800, "Clear", "clear sky", "01"],
  1: [801, "Clouds", "few clouds", "02"],
  2: [802, "Clouds", "scattered clouds", "03"],
  3: [804, "Clouds", "overcast clouds", "04"],
  45: [741, "Fog", "fog", "50"],
  48: [741, "Fog", "rime fog", "50"],
  51: [300, "Drizzle", "light drizzle", "09"],
  53: [301, "Drizzle", "drizzle", "09"],
  55: [302, "Drizzle", "heavy drizzle", "09"],
  56: [511, "Rain", "light freezing drizzle", "13"],
  57: [511, "Rain", "freezing drizzle", "13"],
  61: [500, "Rain", "light rain", "10"],
  63: [501, "Rain", "moderate rain", "10"],
  65: [502, "Rain", "heavy rain", "10"],
  66: [511, "Rain", "light freezing rain", "13"],
  67: [511, "Rain", "freezing rain", "13"],
  71: [600, "Snow", "light snow", "13"],
  73: [601, "Snow", "snow", "13"],
  75: [602, "Snow", "heavy snow", "13"],
  77: [600, "Snow", "snow grains", "13"],
  80: [520, "Rain", "light shower rain", "09"],
  81: [521, "Rain", "shower rain", "09"],
  82: [522, "Rain", "heavy shower rain", "09"],
  85: [620, "Snow", "light snow showers", "13"],
  86: [622, "Snow", "heavy snow showers", "13"],
  95: [211, "Thunderstorm", "thunderstorm", "11"],
  96: [202, "Thunderstorm", "thunderstorm with hail", "11"],
  99: [202, "Thunderstorm", "thunderstorm with heavy hail", "11"],
};

function condition(code: Num, isDay: boolean) {
  const [id, main, description, icon] = WMO[num(code, 0)] ?? WMO[0];
  return [{ id, main, description, icon: `${icon}${isDay ? "d" : "n"}` }];
}

/* -------------------------------------------------------------------------- */
/*  Forecast                                                                   */
/* -------------------------------------------------------------------------- */

type Series = Num[];

export type OpenMeteoForecast = {
  latitude?: number;
  longitude?: number;
  timezone: string;
  utc_offset_seconds: number;
  current: {
    time: number;
    temperature_2m?: Num;
    apparent_temperature?: Num;
    relative_humidity_2m?: Num;
    pressure_msl?: Num;
    cloud_cover?: Num;
    wind_speed_10m?: Num;
    wind_direction_10m?: Num;
    wind_gusts_10m?: Num;
    weather_code?: Num;
    is_day?: Num;
  };
  hourly: {
    time: number[];
    temperature_2m: Series;
    apparent_temperature: Series;
    relative_humidity_2m: Series;
    dew_point_2m: Series;
    pressure_msl: Series;
    cloud_cover: Series;
    visibility: Series;
    wind_speed_10m: Series;
    wind_direction_10m: Series;
    wind_gusts_10m: Series;
    uv_index: Series;
    weather_code: Series;
    precipitation_probability: Series;
    is_day: Series;
  };
  daily: {
    time: number[];
    weather_code: Series;
    temperature_2m_max: Series;
    temperature_2m_min: Series;
    sunrise: Series;
    sunset: Series;
    wind_speed_10m_max: Series;
    wind_gusts_10m_max: Series;
    wind_direction_10m_dominant: Series;
    uv_index_max: Series;
    precipitation_sum: Series;
    precipitation_probability_max: Series;
  };
};

const avg = (series: Series, from: number, to: number) => {
  const values = series
    .slice(from, to)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : undefined;
};

/** Moon phase as OpenWeather defines it: 0 / 1 = new moon, 0.5 = full moon. */
const moonPhase = (unixSeconds: number) => {
  const julianDay = unixSeconds / 86400 + 2440587.5;
  const synodic = 29.530588853;
  const phase = ((julianDay - 2451550.1) / synodic) % 1;
  return Number((phase < 0 ? phase + 1 : phase).toFixed(2));
};

export function mapOpenMeteoWeather(raw: OpenMeteoForecast) {
  const { current: c, hourly: h, daily: d } = raw;

  // index of the hourly slot that contains "now"
  let now = 0;
  for (let i = 0; i < h.time.length; i++) {
    if (h.time[i] <= c.time) now = i;
    else break;
  }

  const at = (series: Series, i: number, fallback = 0) =>
    num(series[Math.min(Math.max(i, 0), series.length - 1)], fallback);

  const hourly = h.time.slice(now, now + 48).map((time, k) => {
    const i = now + k;
    return {
      dt: time,
      temp: at(h.temperature_2m, i),
      feels_like: at(h.apparent_temperature, i),
      pressure: at(h.pressure_msl, i),
      humidity: at(h.relative_humidity_2m, i),
      dew_point: at(h.dew_point_2m, i),
      uvi: at(h.uv_index, i),
      clouds: at(h.cloud_cover, i),
      visibility: at(h.visibility, i, 10000),
      wind_speed: at(h.wind_speed_10m, i),
      wind_deg: at(h.wind_direction_10m, i),
      wind_gust: at(h.wind_gusts_10m, i),
      weather: condition(h.weather_code[i], at(h.is_day, i, 1) === 1),
      pop: at(h.precipitation_probability, i) / 100,
    };
  });

  const daily = d.time.map((_, i) => {
    const from = i * 24;
    const to = from + 24;
    const max = num(d.temperature_2m_max[i]);
    const min = num(d.temperature_2m_min[i]);
    const mid = (max + min) / 2;
    const hourTemp = (hour: number) => {
      const v = h.temperature_2m[from + hour];
      return typeof v === "number" ? v : mid;
    };
    const feels = (hour: number) => {
      const v = h.apparent_temperature[from + hour];
      return typeof v === "number" ? v : mid;
    };
    const weather = condition(d.weather_code[i], true);
    // local noon, which is the timestamp OpenWeather uses for daily entries
    const noon = (h.time[from] ?? c.time) + 12 * 3600;

    return {
      dt: noon,
      sunrise: num(d.sunrise[i]),
      sunset: num(d.sunset[i]),
      moonrise: 0, // not provided by Open-Meteo
      moonset: 0,
      moon_phase: moonPhase(noon),
      summary: `Expect ${weather[0].description} with a high of ${Math.round(max)}°C and a low of ${Math.round(min)}°C.`,
      temp: {
        day: hourTemp(12),
        min,
        max,
        night: hourTemp(21),
        eve: hourTemp(18),
        morn: hourTemp(6),
      },
      feels_like: {
        day: feels(12),
        night: feels(21),
        eve: feels(18),
        morn: feels(6),
      },
      pressure: avg(h.pressure_msl, from, to) ?? 0,
      humidity: avg(h.relative_humidity_2m, from, to) ?? 0,
      dew_point: avg(h.dew_point_2m, from, to) ?? 0,
      wind_speed: num(d.wind_speed_10m_max[i]),
      wind_deg: num(d.wind_direction_10m_dominant[i]),
      wind_gust: num(d.wind_gusts_10m_max[i]),
      weather,
      clouds: avg(h.cloud_cover, from, to) ?? 0,
      pop: num(d.precipitation_probability_max[i]) / 100,
      rain: num(d.precipitation_sum[i]),
      uvi: num(d.uv_index_max[i]),
    };
  });

  return weatherSchema.parse({
    lat: num(raw.latitude),
    lon: num(raw.longitude),
    timezone: raw.timezone,
    timezone_offset: raw.utc_offset_seconds,
    current: {
      dt: c.time,
      sunrise: num(d.sunrise[0]),
      sunset: num(d.sunset[0]),
      temp: num(c.temperature_2m),
      feels_like: num(c.apparent_temperature),
      pressure: num(c.pressure_msl),
      humidity: num(c.relative_humidity_2m),
      dew_point: at(h.dew_point_2m, now),
      uvi: at(h.uv_index, now),
      clouds: num(c.cloud_cover),
      visibility: at(h.visibility, now, 10000),
      wind_speed: num(c.wind_speed_10m),
      wind_deg: num(c.wind_direction_10m),
      wind_gust: num(c.wind_gusts_10m),
      weather: condition(c.weather_code, num(c.is_day, 1) === 1),
    },
    hourly,
    daily,
  });
}

async function getJson(url: string, name: string) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.reason ?? `${name} request failed (${res.status})`);
  }
  return data;
}

export async function getWeatherOpenMeteo({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(long),
    timezone: "auto",
    timeformat: "unixtime",
    wind_speed_unit: "ms",
    forecast_days: "8",
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "pressure_msl",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "weather_code",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "dew_point_2m",
      "pressure_msl",
      "cloud_cover",
      "visibility",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
      "weather_code",
      "precipitation_probability",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
    ].join(","),
  });

  const raw = await getJson(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    "Open-Meteo"
  );
  return mapOpenMeteoWeather(raw);
}

/* -------------------------------------------------------------------------- */
/*  Air quality                                                                */
/* -------------------------------------------------------------------------- */

// European AQI (0-100+) -> OpenWeather's 1-5 scale
const toOwmAqi = (europeanAqi: Num, pm25: number) => {
  if (typeof europeanAqi === "number") {
    if (europeanAqi <= 20) return 1;
    if (europeanAqi <= 40) return 2;
    if (europeanAqi <= 60) return 3;
    if (europeanAqi <= 80) return 4;
    return 5;
  }
  if (pm25 < 10) return 1;
  if (pm25 < 25) return 2;
  if (pm25 < 50) return 3;
  if (pm25 < 75) return 4;
  return 5;
};

export async function getAirPollutionOpenMeteo({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(long),
    timeformat: "unixtime",
    current: [
      "european_aqi",
      "pm10",
      "pm2_5",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
    ].join(","),
  });

  const raw = await getJson(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    "Open-Meteo air quality"
  );
  const c = raw.current ?? {};
  const pm25 = num(c.pm2_5);

  // Open-Meteo has no NO / NH3 data, so those two are simply left out.
  return AirPollutionSchema.parse({
    coord: { lat: num(raw.latitude, lat), lon: num(raw.longitude, long) },
    list: [
      {
        dt: num(c.time),
        main: { aqi: toOwmAqi(c.european_aqi, pm25) },
        components: {
          co: num(c.carbon_monoxide),
          no2: num(c.nitrogen_dioxide),
          o3: num(c.ozone),
          so2: num(c.sulphur_dioxide),
          pm2_5: pm25,
          pm10: num(c.pm10),
        },
      },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/*  Geocoding                                                                  */
/* -------------------------------------------------------------------------- */

// The location dropdown only offers these cities, so they are resolved locally
// (exact, instant, no network). Anything else goes to Open-Meteo's geocoder.
const CITIES: Record<string, { lat: number; lon: number; country: string }> = {
  "new york": { lat: 40.7128, lon: -74.006, country: "US" },
  london: { lat: 51.5074, lon: -0.1278, country: "GB" },
  delhi: { lat: 28.6139, lon: 77.209, country: "IN" },
  mumbai: { lat: 19.076, lon: 72.8777, country: "IN" },
  kolkata: { lat: 22.5726, lon: 88.3639, country: "IN" },
  tokyo: { lat: 35.6762, lon: 139.6503, country: "JP" },
  sydney: { lat: -33.8688, lon: 151.2093, country: "AU" },
  paris: { lat: 48.8566, lon: 2.3522, country: "FR" },
  berlin: { lat: 52.52, lon: 13.405, country: "DE" },
  moscow: { lat: 55.7558, lon: 37.6173, country: "RU" },
  "rio de janeiro": { lat: -22.9068, lon: -43.1729, country: "BR" },
  "cape town": { lat: -33.9249, lon: 18.4241, country: "ZA" },
  beijing: { lat: 39.9042, lon: 116.4074, country: "CN" },
};

export async function getGeoCodeOpenMeteo(location: string) {
  const known = CITIES[location.trim().toLowerCase()];
  if (known) {
    return GeocodeSchema.parse([{ name: location, ...known }]);
  }

  const raw = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`,
    "Open-Meteo geocoding"
  );
  const results: {
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    admin1?: string;
  }[] = raw.results ?? [];

  return GeocodeSchema.parse(
    results.map((r) => ({
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country_code ?? "",
      state: r.admin1,
    }))
  );
}
