import path from 'node:path';
import { z } from 'zod';
import packageJson from '../../package.json';

function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function asInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.preprocess((value) => asInt(value, 3000), z.number().int().positive()),
  CORS_ORIGIN: z.string().default('*'),
  BODY_SIZE_LIMIT: z.string().default('64kb'),
  REQUEST_TIMEOUT_MS: z.preprocess((value) => asInt(value, 3000), z.number().int().positive()),

  API_KEYS_FILE: z.string().default('./data/api-keys.json'),

  DISPOSABLE_LIST_FILE: z.string().default('./data/disposable_domains.txt'),
  DISPOSABLE_LIST_VERSION_FILE: z.string().default('./data/disposable_domains.version'),
  ROLE_BASED_LOCALS_FILE: z.string().default('./data/role_based_locals.txt'),
  TYPO_SUSPECTS_FILE: z.string().default('./data/typo_suspects.json'),
  ENABLE_MX_CHECK: z.preprocess((value) => asBoolean(value), z.boolean().default(false)),
  MX_CACHE_TTL_MS: z.preprocess((value) => asInt(value, 21600000), z.number().int().positive()),
  DOMAIN_CACHE_TTL_MS: z.preprocess((value) => asInt(value, 3600000), z.number().int().positive()),

  BATCH_MAX_ITEMS: z.preprocess((value) => asInt(value, 50), z.number().int().positive()),
  BATCH_CONCURRENCY: z.preprocess((value) => asInt(value, 5), z.number().int().positive()),

  RATE_LIMIT_WINDOW_MS: z.preprocess((value) => asInt(value, 60000), z.number().int().positive()),
  RATE_LIMIT_MAX: z.preprocess((value) => asInt(value, 60), z.number().int().positive()),
  RATE_LIMIT_BURST: z.preprocess((value) => asInt(value, 30), z.number().int().nonnegative()),
  RATE_LIMIT_COOLDOWN_MS: z.preprocess((value) => asInt(value, 120000), z.number().int().positive()),
  RATE_LIMIT_PERSISTENCE_MODE: z.enum(['memory', 'file']).default('memory'),
  RATE_LIMIT_STATE_FILE: z.string().default('./data/rate-limit-state.json'),

  USAGE_PERSISTENCE_MODE: z.enum(['memory', 'file']).default('memory'),
  USAGE_STATE_FILE: z.string().default('./data/usage-state.json'),
  USAGE_RETENTION_MS: z.preprocess((value) => asInt(value, 604800000), z.number().int().positive()),

  ENABLE_PROVIDER: z.preprocess((value) => asBoolean(value), z.boolean().default(false)),
  PROVIDER_BASE_URL: z.string().optional(),
  PROVIDER_API_KEY: z.string().optional(),
  PROVIDER_PATH: z.string().optional(),
  PROVIDER_TIMEOUT_MS: z.preprocess((value) => asInt(value, 2500), z.number().int().positive()),
  PROVIDER_RETRIES: z.preprocess((value) => asInt(value, 2), z.number().int().min(0).max(5)),

  TOKENS_METRICS_ENABLED: z.preprocess((value) => asBoolean(value), z.boolean().default(false))
});

function resolvePath(baseDir: string, filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(baseDir, filePath);
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  serviceName: 'MailSieve';
  serviceVersion: string;
  corsOrigin: string;
  bodySizeLimit: string;
  requestTimeoutMs: number;
  batchMaxItems: number;
  batchMaxConcurrency: number;
  domainCacheTtlMs: number;
  tokensMetricsEnabled: boolean;
  files: {
    apiKeysFile: string;
    disposableListFile: string;
    disposableListVersionFile: string;
    roleBasedLocalsFile: string;
    typoSuspectsFile: string;
  };
  mx: {
    enabled: boolean;
    cacheTtlMs: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    burst: number;
    cooldownMs: number;
    persistenceMode: 'memory' | 'file';
    stateFile: string;
  };
  usage: {
    persistenceMode: 'memory' | 'file';
    stateFile: string;
    retentionMs: number;
  };
  provider: {
    enabled: boolean;
    baseUrl?: string;
    apiKey?: string;
    path?: string;
    timeoutMs: number;
    retries: number;
  };
}

export function loadConfig(rawEnv: NodeJS.ProcessEnv = process.env, baseDir = process.cwd()): AppConfig {
  const normalizedEnv: Record<string, unknown> = {
    ...rawEnv,
    BODY_SIZE_LIMIT: rawEnv.BODY_SIZE_LIMIT ?? rawEnv.JSON_BODY_LIMIT,
    REQUEST_TIMEOUT_MS: rawEnv.REQUEST_TIMEOUT_MS ?? rawEnv.PROCESSING_TIMEOUT_MS,
    BATCH_CONCURRENCY: rawEnv.BATCH_CONCURRENCY ?? rawEnv.BATCH_MAX_CONCURRENCY
  };

  const parsed = envSchema.safeParse(normalizedEnv);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Falha na validação de ambiente:\n- ${details.join('\n- ')}`);
  }

  const env = parsed.data;

  if (env.BATCH_CONCURRENCY > env.BATCH_MAX_ITEMS) {
    throw new Error('Falha na validação de ambiente: BATCH_CONCURRENCY não pode exceder BATCH_MAX_ITEMS.');
  }

  if (env.ENABLE_PROVIDER && (!env.PROVIDER_BASE_URL || !env.PROVIDER_API_KEY || !env.PROVIDER_PATH)) {
    throw new Error(
      'Falha na validação de ambiente: ENABLE_PROVIDER=true exige PROVIDER_BASE_URL, PROVIDER_API_KEY e PROVIDER_PATH.'
    );
  }

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    serviceName: 'MailSieve',
    serviceVersion: packageJson.version,
    corsOrigin: env.CORS_ORIGIN,
    bodySizeLimit: env.BODY_SIZE_LIMIT,
    requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
    batchMaxItems: env.BATCH_MAX_ITEMS,
    batchMaxConcurrency: env.BATCH_CONCURRENCY,
    domainCacheTtlMs: env.DOMAIN_CACHE_TTL_MS,
    tokensMetricsEnabled: env.TOKENS_METRICS_ENABLED,
    files: {
      apiKeysFile: resolvePath(baseDir, env.API_KEYS_FILE),
      disposableListFile: resolvePath(baseDir, env.DISPOSABLE_LIST_FILE),
      disposableListVersionFile: resolvePath(baseDir, env.DISPOSABLE_LIST_VERSION_FILE),
      roleBasedLocalsFile: resolvePath(baseDir, env.ROLE_BASED_LOCALS_FILE),
      typoSuspectsFile: resolvePath(baseDir, env.TYPO_SUSPECTS_FILE)
    },
    mx: {
      enabled: env.ENABLE_MX_CHECK,
      cacheTtlMs: env.MX_CACHE_TTL_MS
    },
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      burst: env.RATE_LIMIT_BURST,
      cooldownMs: env.RATE_LIMIT_COOLDOWN_MS,
      persistenceMode: env.RATE_LIMIT_PERSISTENCE_MODE,
      stateFile: resolvePath(baseDir, env.RATE_LIMIT_STATE_FILE)
    },
    usage: {
      persistenceMode: env.USAGE_PERSISTENCE_MODE,
      stateFile: resolvePath(baseDir, env.USAGE_STATE_FILE),
      retentionMs: env.USAGE_RETENTION_MS
    },
    provider: {
      enabled: env.ENABLE_PROVIDER,
      baseUrl: env.PROVIDER_BASE_URL,
      apiKey: env.PROVIDER_API_KEY,
      path: env.PROVIDER_PATH,
      timeoutMs: env.PROVIDER_TIMEOUT_MS,
      retries: env.PROVIDER_RETRIES
    }
  };
}
