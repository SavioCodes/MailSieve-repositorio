#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function resolveKeysFile() {
  const configured = process.env.API_KEYS_FILE || './data/api-keys.json';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function hashApiKey(rawKey, salt) {
  return crypto.createHash('sha256').update(`${salt}:${rawKey}`, 'utf8').digest('hex');
}

function createApiKey() {
  return `msk_${crypto.randomBytes(18).toString('hex')}`;
}

function createKeyId() {
  return `key_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function readStore(filePath) {
  if (!fs.existsSync(filePath)) {
    return { version: 2, keys: [] };
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return { version: 2, keys: [] };
  }

  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.keys)) {
    return { version: 2, keys: [] };
  }

  return {
    version: Number(parsed.version) || 2,
    keys: parsed.keys.map((entry, index) => ({
      id: entry.id || `legacy_${index + 1}`,
      name: entry.name || `legacy_${index + 1}`,
      status: entry.status === 'revoked' ? 'revoked' : 'active',
      created_at: entry.created_at || new Date().toISOString(),
      revoked_at: entry.revoked_at || null,
      rotated_to_id: entry.rotated_to_id || null,
      key_hash: entry.key_hash,
      salt: entry.salt,
      key: entry.key
    }))
  };
}

function writeStore(filePath, store) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf8');
}

function createCommand(filePath, keyName) {
  const store = readStore(filePath);
  const now = new Date().toISOString();
  const apiKey = createApiKey();
  const salt = crypto.randomBytes(16).toString('hex');
  const keyHash = hashApiKey(apiKey, salt);
  const id = createKeyId();

  store.keys.push({
    id,
    name: keyName || id,
    status: 'active',
    created_at: now,
    revoked_at: null,
    rotated_to_id: null,
    key_hash: keyHash,
    salt
  });

  writeStore(filePath, store);
  console.log(
    JSON.stringify(
      {
        action: 'create',
        id,
        api_key: apiKey,
        aviso: 'A chave aparece somente nesta saída. Armazene com segurança.'
      },
      null,
      2
    )
  );
}

function revokeCommand(filePath, keyId) {
  if (!keyId) {
    console.error('Uso: npm run keys:revoke -- <key_id>');
    process.exit(1);
  }

  const store = readStore(filePath);
  const record = store.keys.find((item) => item.id === keyId);

  if (!record) {
    console.error('key_id não encontrado.');
    process.exit(1);
  }

  if (record.status === 'revoked') {
    console.log(JSON.stringify({ action: 'revoke', id: keyId, status: 'already_revoked' }, null, 2));
    return;
  }

  record.status = 'revoked';
  record.revoked_at = new Date().toISOString();
  writeStore(filePath, store);
  console.log(JSON.stringify({ action: 'revoke', id: keyId, status: 'revoked' }, null, 2));
}

function listCommand(filePath) {
  const store = readStore(filePath);
  const output = store.keys.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    created_at: item.created_at,
    revoked_at: item.revoked_at,
    rotated_to_id: item.rotated_to_id
  }));

  console.log(JSON.stringify({ action: 'list', keys: output }, null, 2));
}

function rotateCommand(filePath, oldKeyId, newName) {
  if (!oldKeyId) {
    console.error('Uso: npm run keys:rotate -- <key_id_antiga> [novo_nome]');
    process.exit(1);
  }

  const store = readStore(filePath);
  const now = new Date().toISOString();
  const record = store.keys.find((item) => item.id === oldKeyId && item.status === 'active');

  if (!record) {
    console.error('key_id ativa não encontrada para rotação.');
    process.exit(1);
  }

  const newApiKey = createApiKey();
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newKeyHash = hashApiKey(newApiKey, newSalt);
  const newId = createKeyId();

  record.status = 'revoked';
  record.revoked_at = now;
  record.rotated_to_id = newId;

  store.keys.push({
    id: newId,
    name: newName || `${record.name}_next`,
    status: 'active',
    created_at: now,
    revoked_at: null,
    rotated_to_id: null,
    key_hash: newKeyHash,
    salt: newSalt
  });

  writeStore(filePath, store);
  console.log(
    JSON.stringify(
      {
        action: 'rotate',
        old_id: oldKeyId,
        new_id: newId,
        api_key: newApiKey,
        aviso: 'A nova chave aparece somente nesta saída. Armazene com segurança.'
      },
      null,
      2
    )
  );
}

function main() {
  const action = process.argv[2];
  const filePath = resolveKeysFile();

  if (!action) {
    console.error('Uso: node scripts/manage_api_keys.js <create|revoke|list|rotate> ...');
    process.exit(1);
  }

  if (action === 'create') {
    createCommand(filePath, process.argv[3]);
    return;
  }

  if (action === 'revoke') {
    revokeCommand(filePath, process.argv[3]);
    return;
  }

  if (action === 'list') {
    listCommand(filePath);
    return;
  }

  if (action === 'rotate') {
    rotateCommand(filePath, process.argv[3], process.argv[4]);
    return;
  }

  console.error(`Ação inválida: ${action}`);
  process.exit(1);
}

main();
