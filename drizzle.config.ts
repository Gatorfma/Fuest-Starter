import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL || "postgres://neondb_owner:5sm0HEZxFlvO@ep-floral-poetry-a24txlv4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});