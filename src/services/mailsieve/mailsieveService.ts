import { resolveMx } from 'node:dns/promises';
import { readJsonFile, readTextLines } from '../../utils/fileStore';
import type { DetectionResult, RiskLevel } from '../../types';
import { createProviderClient } from '../provider/providerClient';

interface DisposableListService {
  hasDomain: (domain: string) => boolean;
  getVersion: () => string;
}

interface MailSieveServiceOptions {
  roleBasedLocalsFile: string;
  typoSuspectsFile: string;
  enableMxCheck: boolean;
  mxCacheTtlMs: number;
  domainCacheTtlMs: number;
  disposableListService: DisposableListService;
  provider: {
    enabled: boolean;
    baseUrl?: string;
    apiKey?: string;
    path?: string;
    timeoutMs: number;
    retries: number;
  };
  logWarn: (payload: Record<string, unknown>) => void;
}

interface MxCacheEntry {
  hasMx: boolean;
  expiresAt: number;
}

interface DomainCacheEntry {
  isDisposable: boolean;
  typoSuspect: boolean;
  mxMissing: boolean;
  expiresAt: number;
}

function normalizeEmail(rawEmail: string): string {
  return rawEmail.trim().toLowerCase().replace(/\s+/g, '');
}

function extractDomain(normalizedEmail: string): string {
  const parts = normalizedEmail.split('@');
  return parts.length === 2 ? parts[1] : '';
}

function isBasicEmailFormatValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function createMailSieveService(options: MailSieveServiceOptions) {
  const roleBasedLocals = new Set(readTextLines(options.roleBasedLocalsFile).map((item) => item.toLowerCase()));

  const typoSuspects = readJsonFile<Record<string, string>>(options.typoSuspectsFile, {});
  const mxCache = new Map<string, MxCacheEntry>();
  const domainCache = new Map<string, DomainCacheEntry>();

  const providerClient = createProviderClient({
    ...options.provider,
    logWarn: options.logWarn
  });

  async function checkMx(domain: string): Promise<{ hasMx: boolean; cacheHit: boolean }> {
    const now = Date.now();
    const cached = mxCache.get(domain);

    if (cached && cached.expiresAt > now) {
      return {
        hasMx: cached.hasMx,
        cacheHit: true
      };
    }

    try {
      const records = await resolveMx(domain);
      const hasMx = Array.isArray(records) && records.length > 0;
      mxCache.set(domain, {
        hasMx,
        expiresAt: now + options.mxCacheTtlMs
      });
      return {
        hasMx,
        cacheHit: false
      };
    } catch {
      mxCache.set(domain, {
        hasMx: false,
        expiresAt: now + options.mxCacheTtlMs
      });
      return {
        hasMx: false,
        cacheHit: false
      };
    }
  }

  function computeRisk(signals: string[], isDisposable: boolean): RiskLevel {
    if (isDisposable) {
      return 'high';
    }

    const mediumSignals = new Set(['role_based_local_part', 'typo_suspect_domain', 'mx_missing_or_unresolvable']);

    if (signals.some((signal) => mediumSignals.has(signal))) {
      return 'medium';
    }

    return 'low';
  }

  async function resolveDomainSignals(domain: string): Promise<{
    isDisposable: boolean;
    typoSuspect: boolean;
    mxMissing: boolean;
    cacheHit: boolean;
  }> {
    const now = Date.now();
    const cached = domainCache.get(domain);

    if (cached && cached.expiresAt > now) {
      return {
        isDisposable: cached.isDisposable,
        typoSuspect: cached.typoSuspect,
        mxMissing: cached.mxMissing,
        cacheHit: true
      };
    }

    const isDisposable = options.disposableListService.hasDomain(domain);
    const typoSuspect = Boolean(typoSuspects[domain]);

    let mxMissing = false;
    let mxCacheHit = false;

    if (options.enableMxCheck) {
      const mxResult = await checkMx(domain);
      mxCacheHit = mxResult.cacheHit;
      mxMissing = !mxResult.hasMx;
    }

    domainCache.set(domain, {
      isDisposable,
      typoSuspect,
      mxMissing,
      expiresAt: now + options.domainCacheTtlMs
    });

    return {
      isDisposable,
      typoSuspect,
      mxMissing,
      cacheHit: mxCacheHit
    };
  }

  async function analyzeEmail(email: string, requestId: string): Promise<DetectionResult> {
    const startedAt = Date.now();
    const normalizedEmail = normalizeEmail(email);

    if (!isBasicEmailFormatValid(normalizedEmail)) {
      throw new Error('invalid_email_format');
    }

    const domain = extractDomain(normalizedEmail);
    const localPart = normalizedEmail.split('@')[0] ?? '';

    const signals = new Set<string>();

    const domainSignals = await resolveDomainSignals(domain);

    if (domainSignals.isDisposable) {
      signals.add('disposable_domain');
    }

    if (roleBasedLocals.has(localPart)) {
      signals.add('role_based_local_part');
    }

    if (domainSignals.typoSuspect) {
      signals.add('typo_suspect_domain');
    }

    if (options.enableMxCheck && domainSignals.mxMissing) {
      signals.add('mx_missing_or_unresolvable');
    }

    const providerResult = await providerClient.call(
      {
        email: normalizedEmail,
        domain,
        signals: Array.from(signals)
      },
      requestId
    );

    if (providerResult.status === 'provider_unavailable') {
      throw new Error('provider_unavailable');
    }

    const signalList = Array.from(signals);

    return {
      email,
      normalized_email: normalizedEmail,
      domain,
      is_disposable: domainSignals.isDisposable,
      risk_level: computeRisk(signalList, domainSignals.isDisposable),
      signals: signalList,
      meta: {
        list_version: options.disposableListService.getVersion(),
        cache_hit: domainSignals.cacheHit,
        processing_ms: Date.now() - startedAt,
        provider_status: providerResult.status
      }
    };
  }

  return {
    analyzeEmail
  };
}
