import { z } from "zod"

export const weatherSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
  timezone_offset: z.number(),
  current: z.object({
    dt: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
    temp: z.number(),
    feels_like: z.number(),
    pressure: z.number(),
    humidity: z.number(),
    dew_point: z.number(),
    uvi: z.number(),
    clouds: z.number(),
    visibility: z.number(),
    wind_speed: z.number(),
    wind_deg: z.number(),
    wind_gust: z.number().optional(),
    weather: z.array(
      z.object({
        id: z.number(),
        main: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    ),
  }),
  hourly: z.array(
    z.object({
      dt: z.number(),
      temp: z.number(),
      feels_like: z.number(),
      pressure: z.number(),
      humidity: z.number(),
      dew_point: z.number(),
      uvi: z.number(),
      clouds: z.number(),
      visibility: z.number(),
      wind_speed: z.number(),
      wind_deg: z.number(),
      wind_gust: z.number(),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      pop: z.number(),
    })
  ),
  daily: z.array(
    z.object({
      dt: z.number(),
      sunrise: z.number(),
      sunset: z.number(),
      moonrise: z.number(),
      moonset: z.number(),
      moon_phase: z.number(),
      summary: z.string(),
      temp: z.object({
        day: z.number(),
        min: z.number(),
        max: z.number(),
        night: z.number(),
        eve: z.number(),
        morn: z.number(),
      }),
      feels_like: z.object({
        day: z.number(),
        night: z.number(),
        eve: z.number(),
        morn: z.number(),
      }),
      pressure: z.number(),
      humidity: z.number(),
      dew_point: z.number(),
      wind_speed: z.number(),
      wind_deg: z.number(),
      wind_gust: z.number(),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      clouds: z.number(),
      pop: z.number(),
      rain: z.number().optional(),
      uvi: z.number(),
    })
  ),
})