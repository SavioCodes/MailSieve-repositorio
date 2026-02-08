import { readJsonFile } from '../../utils/fileStore';
import { constantTimeEqualHex, hashApiKey } from '../../utils/apiKeyHash';

export interface ApiKeyRecord {
  id: string;
  name: string;
  status: 'active' | 'revoked';
  created_at: string;
  revoked_at: string | null;
  rotated_to_id: string | null;
  key_hash?: string;
  salt?: string;
  key?: string;
}

interface ApiKeyStore {
  keys: ApiKeyRecord[];
}

export function createApiKeyService(apiKeysFile: string) {
  function listKeys(): ApiKeyRecord[] {
    const store = readJsonFile<ApiKeyStore>(apiKeysFile, { keys: [] });
    if (!Array.isArray(store.keys)) {
      return [];
    }

    return store.keys.map((entry, index) => ({
      ...entry,
      id: entry.id || `legacy_${index + 1}`,
      rotated_to_id: entry.rotated_to_id ?? null
    }));
  }

  function validateKey(rawKey: string | undefined):
    | { valid: true; record: ApiKeyRecord }
    | { valid: false; reason: 'missing' | 'invalid' } {
    if (!rawKey || !rawKey.trim()) {
      return { valid: false, reason: 'missing' };
    }

    const normalized = rawKey.trim();

    for (const entry of listKeys()) {
      if (entry.status !== 'active') {
        continue;
      }

      if (entry.key_hash && entry.salt) {
        const candidateHash = hashApiKey(normalized, entry.salt);
        if (constantTimeEqualHex(candidateHash, entry.key_hash)) {
          return { valid: true, record: entry };
        }
      }

      if (entry.key && entry.key === normalized) {
        return { valid: true, record: entry };
      }
    }

    return { valid: false, reason: 'invalid' };
  }

  return {
    listKeys,
    validateKey
  };
}
