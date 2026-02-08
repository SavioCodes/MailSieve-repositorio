const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const { loadConfig } = require('../../dist/src/config/env');
const { createApp } = require('../../dist/src/app');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function hashApiKey(rawKey, salt) {
  return crypto.createHash('sha256').update(`${salt}:${rawKey}`, 'utf8').digest('hex');
}

function createTestApp(options = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mailsieve-test-'));
  const apiKey = options.apiKey || 'test-api-key';
  const apiKeyId = options.apiKeyId || 'key_test_local';

  const apiKeysFile = path.join(tempDir, 'data', 'api-keys.json');
  const listFile = path.join(tempDir, 'data', 'disposable_domains.txt');
  const versionFile = path.join(tempDir, 'data', 'disposable_domains.version');
  const roleFile = path.join(tempDir, 'data', 'role_based_locals.txt');
  const typoFile = path.join(tempDir, 'data', 'typo_suspects.json');

  const salt = 'testsalt1234567890testsalt1234567890';
  const keyHash = hashApiKey(apiKey, salt);

  writeFile(
    apiKeysFile,
    JSON.stringify(
      {
        version: 2,
        keys: [
          {
            id: apiKeyId,
            name: 'test',
            status: 'active',
            created_at: new Date().toISOString(),
            revoked_at: null,
            rotated_to_id: null,
            key_hash: keyHash,
            salt
          }
        ]
      },
      null,
      2
    )
  );

  writeFile(listFile, 'mailinator.com\n10minutemail.com\n');
  writeFile(
    versionFile,
    ['source=test', 'license=CC0-1.0', 'version=test-v1', `updated_at=${new Date().toISOString()}`].join('\n')
  );
  writeFile(roleFile, 'admin\nsupport\n');
  writeFile(typoFile, JSON.stringify({ 'gmai.com': 'gmail.com' }, null, 2));

  const env = {
    NODE_ENV: 'test',
    PORT: '3000',
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
    BATCH_MAX_ITEMS: '20',
    BATCH_CONCURRENCY: '3',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '30',
    RATE_LIMIT_BURST: '5',
    RATE_LIMIT_COOLDOWN_MS: '120000',
    RATE_LIMIT_PERSISTENCE_MODE: 'memory',
    RATE_LIMIT_STATE_FILE: path.join(tempDir, 'data', 'rate-limit-state.json'),
    USAGE_PERSISTENCE_MODE: 'memory',
    USAGE_STATE_FILE: path.join(tempDir, 'data', 'usage-state.json'),
    USAGE_RETENTION_MS: '600000',
    ENABLE_PROVIDER: 'false',
    PROVIDER_BASE_URL: '',
    PROVIDER_API_KEY: '',
    PROVIDER_PATH: '',
    PROVIDER_TIMEOUT_MS: '1000',
    PROVIDER_RETRIES: '1',
    ...(options.env || {})
  };

  const config = loadConfig(env, tempDir);
  const { app } = createApp(config);

  return {
    app,
    apiKey,
    apiKeyId,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

module.exports = {
  createTestApp
};
