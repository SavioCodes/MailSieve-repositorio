#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function parseWindowMinutes() {
  const index = process.argv.indexOf('--window-minutes');
  if (index === -1) {
    return null;
  }

  const raw = process.argv[index + 1];
  const parsed = Number.parseInt(raw || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function resolveUsageFile() {
  const configured = process.env.USAGE_STATE_FILE || './data/usage-state.json';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function resolveOutputFile() {
  const configured = process.env.USAGE_REPORT_FILE || './reports/usage-report.json';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function summarize(state, windowMinutes) {
  const now = Date.now();
  const minTs = windowMinutes ? now - windowMinutes * 60 * 1000 : Number.MIN_SAFE_INTEGER;

  const keys = {};
  let requestsTotal = 0;
  let errorsTotal = 0;

  for (const [apiKey, entry] of Object.entries(state.keys || {})) {
    const events = Array.isArray(entry.events) ? entry.events.filter((event) => event.ts >= minTs) : [];
    const latencies = events.map((event) => Number(event.latency_ms || 0));
    const requests = events.length;
    const errors = events.filter((event) => Boolean(event.is_error)).length;

    const avg = latencies.length ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length : 0;

    keys[apiKey] = {
      requests_total: requests,
      errors_total: errors,
      latency_avg_ms: Number(avg.toFixed(2)),
      latency_p95_ms: percentile(latencies, 95),
      last_seen_at: entry.last_seen_at || null
    };

    requestsTotal += requests;
    errorsTotal += errors;
  }

  return {
    generated_at: new Date(now).toISOString(),
    window_minutes: windowMinutes,
    summary: {
      requests_total: requestsTotal,
      errors_total: errorsTotal,
      key_count: Object.keys(keys).length
    },
    keys
  };
}

function main() {
  const usageFile = resolveUsageFile();
  const outputFile = resolveOutputFile();
  const windowMinutes = parseWindowMinutes();

  let state = { keys: {} };
  let sourceState = 'empty';

  if (fs.existsSync(usageFile)) {
    const raw = fs.readFileSync(usageFile, 'utf8');
    state = raw.trim() ? JSON.parse(raw) : { keys: {} };
    sourceState = 'loaded';
  }

  const report = summarize(state, windowMinutes);
  report.source_state = sourceState;
  report.note =
    sourceState === 'loaded'
      ? 'usage state loaded from file'
      : 'usage state file not found, generated empty report';

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Relatorio salvo em ${outputFile}`);
}

main();