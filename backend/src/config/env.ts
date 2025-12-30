import { z } from 'zod';

const envSchema = z
  .object({
    LLM_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    PORT: z.string().default('4000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_CALLBACK_URL: z.string(),
    JWT_SECRET: z.string(),
    SESSION_SECRET: z.string(),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
  })
  .refine(
    (data) => {
      if (data.LLM_PROVIDER === 'openai' && !data.OPENAI_API_KEY) {
        return false;
      }
      if (data.LLM_PROVIDER === 'gemini' && !data.GEMINI_API_KEY) {
        return false;
      }
      return true;
    },
    {
      message:
        'API key is required for the selected LLM provider (OPENAI_API_KEY for openai, GEMINI_API_KEY for gemini)',
    }
  );

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    if (parsed.error.issues.length > 0) {
      parsed.error.issues.forEach((issue) => {
        console.error(`  - ${issue.message}`);
      });
    }
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();
