#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const sourceUrl = process.env.DISPOSABLE_LIST_SOURCE_URL || process.argv[2] || '';
  const listPathRaw = process.env.DISPOSABLE_LIST_FILE || './data/disposable_domains.txt';
  const versionPathRaw = process.env.DISPOSABLE_LIST_VERSION_FILE || './data/disposable_domains.version';

  const listPath = path.isAbsolute(listPathRaw) ? listPathRaw : path.resolve(process.cwd(), listPathRaw);
  const versionPath = path.isAbsolute(versionPathRaw)
    ? versionPathRaw
    : path.resolve(process.cwd(), versionPathRaw);

  if (!sourceUrl) {
    console.log(
      '[SUPOSIÇÃO] Nenhuma URL de fonte foi definida. Use DISPOSABLE_LIST_SOURCE_URL apontando para uma lista CC0 validada.'
    );
    process.exit(0);
  }

  let response;
  try {
    response = await fetch(sourceUrl);
  } catch {
    console.error('Falha de rede ao baixar a lista disposable.');
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`Falha ao baixar lista disposable. HTTP ${response.status}`);
    process.exit(1);
  }

  const raw = await response.text();
  const domains = raw
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (domains.length === 0) {
    console.error('Lista baixada sem domínios válidos.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(listPath), { recursive: true });
  fs.mkdirSync(path.dirname(versionPath), { recursive: true });

  fs.writeFileSync(listPath, `${domains.join('\n')}\n`, 'utf8');

  const nowIso = new Date().toISOString();
  const versionContent = [
    `source=${sourceUrl}`,
    'license=CC0-1.0',
    `version=updated-${nowIso.slice(0, 10)}`,
    `updated_at=${nowIso}`
  ].join('\n');

  fs.writeFileSync(versionPath, `${versionContent}\n`, 'utf8');

  console.log(`Lista atualizada com ${domains.length} domínios.`);
  console.log(`Versão registrada em ${versionPath}.`);
}

main();