import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "postgresql://node@localhost:5432/mentorhub",
  jwtSecret: process.env.JWT_SECRET || "mentorhub_jwt_dev_secret_key_2026_secured",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  aiProvider: process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : process.env.ANTHROPIC_API_KEY ? "anthropic" : "mock"),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  aiModel: process.env.AI_MODEL || (process.env.GEMINI_API_KEY ? "gemini-3.5-flash" : "claude-3-5-sonnet-20241022"),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 500),
  googleAllowedDomain: process.env.GOOGLE_ALLOWED_DOMAIN || "university.edu",
};

