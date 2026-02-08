#!/usr/bin/env node
const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/, '');
const apiKey = process.env.API_KEY || '';

if (!baseUrl || !apiKey) {
  console.error('Uso: BASE_URL=<url> API_KEY=<key> npm run smoke:deploy');
  process.exit(1);
}

async function request(method, routePath, body, withAuth = true) {
  const headers = { 'content-type': 'application/json' };
  if (withAuth) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, body: json ?? text };
}

function ensure(condition, message, result) {
  if (!condition) {
    console.error(message);
    if (result) {
      console.error(JSON.stringify(result, null, 2));
    }
    process.exit(1);
  }
}

async function run() {
  const health = await request('GET', '/v1/health');
  ensure(health.status === 200, 'health falhou', health);

  const generate = await request('POST', '/v1/generate', { email: 'user@mailinator.com' });
  ensure(generate.status === 200, 'generate falhou', generate);

  const batch = await request('POST', '/v1/batch', { emails: ['um@mailinator.com', 'dois@gmail.com'] });
  ensure(batch.status === 200, 'batch falhou', batch);

  const authError = await request('POST', '/v1/generate', { email: 'user@gmail.com' }, false);
  ensure(authError.status === 401, 'auth error esperado 401', authError);

  const invalid = await request('POST', '/v1/generate', { email: 'invalido' });
  ensure(invalid.status === 400, 'invalid request esperado 400', invalid);

  console.log('OK: smoke deploy passou.');
}

run().catch((error) => {
  console.error(`Smoke deploy falhou: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exit(1);
});
