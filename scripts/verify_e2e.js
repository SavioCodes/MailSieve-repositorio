#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hashApiKey(rawKey, salt) {
  return crypto.createHash('sha256').update(`${salt}:${rawKey}`, 'utf8').digest('hex');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
  writeFile(filePath, JSON.stringify(value, null, 2));
}

async function requestJson(baseUrl, method, routePath, body, headers = {}) {
  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return {
    status: response.status,
    headers: response.headers,
    text,
    json
  };
}

function formatResponse(result) {
  return JSON.stringify(
    {
      status: result.status,
      body: result.json ?? result.text
    },
    null,
    2
  );
}

function assertCondition(condition, message, result) {
  if (!condition) {
    const details = result ? `\nResposta:\n${formatResponse(result)}` : '';
    throw new Error(`${message}${details}`);
  }
}

async function waitUntilReady(baseUrl, apiKey) {
  let lastError = null;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const health = await requestJson(baseUrl, 'GET', '/v1/health', undefined, {
        'x-api-key': apiKey
      });
      if (health.status === 200) {
        return;
      }
      lastError = new Error(`Health retornou ${health.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(200);
  }
  throw new Error(`Servidor não ficou pronto a tempo: ${lastError?.message ?? 'erro desconhecido'}`);
}

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mailsieve-verify-'));
  const port = 3900 + Math.floor(Math.random() * 400);
  const baseUrl = `http://127.0.0.1:${port}`;
  const apiKey = 'verify-dev-key';
  const apiKeyRate = 'verify-rate-key';
  const salt = crypto.randomBytes(16).toString('hex');
  const saltRate = crypto.randomBytes(16).toString('hex');
  const apiKeyHash = hashApiKey(apiKey, salt);
  const apiKeyRateHash = hashApiKey(apiKeyRate, saltRate);

  const apiKeysFile = path.join(tempDir, 'data', 'api-keys.json');
  const listFile = path.join(tempDir, 'data', 'disposable_domains.txt');
  const versionFile = path.join(tempDir, 'data', 'disposable_domains.version');
  const roleFile = path.join(tempDir, 'data', 'role_based_locals.txt');
  const typoFile = path.join(tempDir, 'data', 'typo_suspects.json');
  const rateStateFile = path.join(tempDir, 'data', 'rate-limit-state.json');
  const usageStateFile = path.join(tempDir, 'data', 'usage-state.json');

  writeJson(apiKeysFile, {
    version: 2,
    keys: [
      {
        id: 'key_verify',
        name: 'verify_key',
        status: 'active',
        created_at: new Date().toISOString(),
        revoked_at: null,
        rotated_to_id: null,
        key_hash: apiKeyHash,
        salt
      },
      {
        id: 'key_verify_rate',
        name: 'verify_rate_key',
        status: 'active',
        created_at: new Date().toISOString(),
        revoked_at: null,
        rotated_to_id: null,
        key_hash: apiKeyRateHash,
        salt: saltRate
      }
    ]
  });
  writeFile(listFile, 'mailinator.com\n10minutemail.com\n');
  writeFile(
    versionFile,
    ['source=verify-local', 'license=CC0-1.0', 'version=verify-v1', `updated_at=${new Date().toISOString()}`].join('\n')
  );
  writeFile(roleFile, 'admin\nsupport\nsales\n');
  writeJson(typoFile, { 'gmai.com': 'gmail.com' });

  const serverProcess = spawn('node', ['dist/src/server.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      CORS_ORIGIN: '*',
      BODY_SIZE_LIMIT: '64kb',
      REQUEST_TIMEOUT_MS: '3000',
      API_KEYS_FILE: apiKeysFile,
      DISPOSABLE_LIST_FILE: listFile,
      DISPOSABLE_LIST_VERSION_FILE: versionFile,
      ROLE_BASED_LOCALS_FILE: roleFile,
      TYPO_SUSPECTS_FILE: typoFile,
      ENABLE_MX_CHECK: 'false',
      MX_CACHE_TTL_MS: '21600000',
      DOMAIN_CACHE_TTL_MS: '3600000',
      BATCH_MAX_ITEMS: '10',
      BATCH_CONCURRENCY: '2',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX: '10',
      RATE_LIMIT_BURST: '0',
      RATE_LIMIT_COOLDOWN_MS: '60000',
      RATE_LIMIT_PERSISTENCE_MODE: 'memory',
      RATE_LIMIT_STATE_FILE: rateStateFile,
      USAGE_PERSISTENCE_MODE: 'file',
      USAGE_STATE_FILE: usageStateFile,
      USAGE_RETENTION_MS: '600000',
      ENABLE_PROVIDER: 'false',
      PROVIDER_BASE_URL: '',
      PROVIDER_API_KEY: '',
      PROVIDER_PATH: '',
      PROVIDER_TIMEOUT_MS: '2000',
      PROVIDER_RETRIES: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stderr = '';
  serverProcess.stderr.on('data', (chunk) => {
    stderr += String(chunk);
  });

  try {
    await waitUntilReady(baseUrl, apiKey);

    const health = await requestJson(baseUrl, 'GET', '/v1/health', undefined, {
      'x-api-key': apiKey
    });
    assertCondition(health.status === 200, 'health deve retornar 200', health);
    assertCondition(health.json?.status === 'ok', 'health.status deve ser ok', health);
    assertCondition(health.json?.name === 'MailSieve', 'health.name deve ser MailSieve', health);

    const generate = await requestJson(
      baseUrl,
      'POST',
      '/v1/generate',
      { email: 'user@mailinator.com' },
      { 'x-api-key': apiKey }
    );
    assertCondition(generate.status === 200, 'generate deve retornar 200', generate);
    assertCondition(generate.json?.is_disposable === true, 'generate.is_disposable deve ser true', generate);
    assertCondition(Array.isArray(generate.json?.signals), 'generate.signals deve ser lista', generate);
    assertCondition(typeof generate.json?.meta?.processing_ms === 'number', 'meta.processing_ms deve ser número', generate);

    const batch = await requestJson(
      baseUrl,
      'POST',
      '/v1/batch',
      { emails: ['um@mailinator.com', 'dois@gmail.com'] },
      { 'x-api-key': apiKey }
    );
    assertCondition(batch.status === 200, 'batch deve retornar 200', batch);
    assertCondition(Array.isArray(batch.json?.results), 'batch.results deve ser lista', batch);
    assertCondition(batch.json.results.length === 2, 'batch.results.length deve ser 2', batch);

    const missingAuth = await requestJson(baseUrl, 'POST', '/v1/generate', { email: 'user@gmail.com' });
    assertCondition(missingAuth.status === 401, 'sem auth deve retornar 401', missingAuth);
    assertCondition(missingAuth.json?.error?.code === 'auth_missing', 'erro sem auth deve ser auth_missing', missingAuth);
    assertCondition(Boolean(missingAuth.json?.error?.request_id), 'erro sem auth deve conter request_id', missingAuth);

    const invalidRequest = await requestJson(
      baseUrl,
      'POST',
      '/v1/generate',
      { email: 'invalido' },
      { 'x-api-key': apiKey }
    );
    assertCondition(invalidRequest.status === 400, 'request inválida deve retornar 400', invalidRequest);
    assertCondition(
      invalidRequest.json?.error?.code === 'invalid_request',
      'erro de request inválida deve ser invalid_request',
      invalidRequest
    );

    let rateLimited = null;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const current = await requestJson(
        baseUrl,
        'POST',
        '/v1/generate',
        { email: `user${attempt}@gmail.com` },
        { 'x-api-key': apiKeyRate }
      );
      if (current.status === 429) {
        rateLimited = current;
        break;
      }
    }
    assertCondition(Boolean(rateLimited), 'rate limit não atingiu 429 no verify');
    assertCondition(rateLimited.status === 429, 'rate limit deve retornar 429', rateLimited);
    assertCondition(rateLimited.json?.error?.code === 'rate_limited', 'erro de rate limit deve ser rate_limited', rateLimited);

    console.log('OK: verify passou (health/generate/batch/auth/invalid/rate-limit).');
    process.exitCode = 0;
  } catch (error) {
    console.error(`VERIFY_FAIL: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    if (stderr.trim()) {
      console.error('SERVER_STDERR:\n' + stderr.trim());
    }
    process.exitCode = 1;
  } finally {
    if (!serverProcess.killed) {
      serverProcess.kill('SIGTERM');
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

run();
