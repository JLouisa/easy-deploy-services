import zennv from "zennv";
import z from "zod";

const envSchema = z.object({
  PORT: z.number().default(3000),
  BUCKET_NAME: z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_R2_TOKEN_VALUE: z.string(),
  CLOUDFLARE_R2_ENDPOINT: z.string(),
  CLOUDFLARE_R2_EU_ENDPOINT: z.string(),
});

export const env = zennv({
  dotenv: true,
  schema: envSchema,
});
