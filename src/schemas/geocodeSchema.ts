import z from "zod"

export const GeocodeSchema = z.array(
  z.object({
    name: z.string(),
    local_names: z.record(z.string(), z.string()),
    lat: z.number(),
    lon: z.number(),
    country: z.string(),
    state: z.string().optional(),
  })
)