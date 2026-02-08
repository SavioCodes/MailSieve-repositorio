import { readJsonFile, writeJsonFile } from '../../utils/fileStore';

interface RateLimitStateItem {
  window_started_at: number;
  request_count: number;
  blocked_until: number;
}

interface RateLimitState {
  keys: Record<string, RateLimitStateItem>;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  burst: number;
  cooldownMs: number;
  persistenceMode: 'memory' | 'file';
  stateFile: string;
}

export interface RateLimitCheck {
  allowed: boolean;
  retryAfterMs?: number;
  limit: number;
  burst: number;
  windowMs: number;
  remaining?: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const defaultState: RateLimitState = { keys: {} };
  const state =
    options.persistenceMode === 'file'
      ? readJsonFile<RateLimitState>(options.stateFile, defaultState)
      : defaultState;

  function persist(): void {
    if (options.persistenceMode === 'file') {
      writeJsonFile(options.stateFile, state);
    }
  }

  function getOrCreate(apiKey: string, now: number): RateLimitStateItem {
    if (!state.keys[apiKey]) {
      state.keys[apiKey] = {
        window_started_at: now,
        request_count: 0,
        blocked_until: 0
      };
    }
    return state.keys[apiKey];
  }

  function check(apiKey: string, now = Date.now()): RateLimitCheck {
    const item = getOrCreate(apiKey, now);

    if (item.blocked_until > now) {
      return {
        allowed: false,
        retryAfterMs: item.blocked_until - now,
        limit: options.max,
        burst: options.burst,
        windowMs: options.windowMs
      };
    }

    if (now - item.window_started_at >= options.windowMs) {
      item.window_started_at = now;
      item.request_count = 0;
      item.blocked_until = 0;
    }

    item.request_count += 1;
    const hardLimit = options.max + options.burst;

    if (item.request_count > hardLimit) {
      item.blocked_until = now + options.cooldownMs;
      persist();
      return {
        allowed: false,
        retryAfterMs: options.cooldownMs,
        limit: options.max,
        burst: options.burst,
        windowMs: options.windowMs
      };
    }

    persist();

    return {
      allowed: true,
      limit: options.max,
      burst: options.burst,
      windowMs: options.windowMs,
      remaining: Math.max(hardLimit - item.request_count, 0)
    };
  }

  return {
    check
  };
}