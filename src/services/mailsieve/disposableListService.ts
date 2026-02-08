import fs from 'node:fs';
import { readTextLines } from '../../utils/fileStore';

function parseVersion(versionFile: string): string {
  if (!fs.existsSync(versionFile)) {
    return 'unknown';
  }

  const lines = readTextLines(versionFile);
  const versionLine = lines.find((line) => line.startsWith('version='));
  if (versionLine) {
    return versionLine.split('=')[1] ?? 'unknown';
  }

  return lines[0] ?? 'unknown';
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^\.+|\.+$/g, '');
}

export function createDisposableListService(listFile: string, versionFile: string) {
  let domainSet = new Set(readTextLines(listFile).map((domain) => domain.toLowerCase()));
  let version = parseVersion(versionFile);

  function reload(): void {
    domainSet = new Set(readTextLines(listFile).map((domain) => domain.toLowerCase()));
    version = parseVersion(versionFile);
  }

  function hasDomain(domain: string): boolean {
    const normalized = normalizeDomain(domain);

    if (!normalized) {
      return false;
    }

    const parts = normalized.split('.');
    if (parts.length < 2) {
      return false;
    }

    for (let index = 0; index <= parts.length - 2; index += 1) {
      const candidate = parts.slice(index).join('.');
      if (domainSet.has(candidate)) {
        return true;
      }
    }

    return false;
  }

  return {
    hasDomain,
    reload,
    getVersion: (): string => version,
    size: (): number => domainSet.size
  };
}
