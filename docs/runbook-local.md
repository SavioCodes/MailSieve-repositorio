# Runbook Local

## FATOS (da fonte validada)

- API deve operar localmente com custo zero.
- Auth por `x-api-key`, rate-limit por chave e lista CC0 local sao requisitos.

## SUPOSICOES

- Rotina de operacao semanal para ambiente pequeno.
- Persistencia de estado em arquivo e opcional e depende de `*_PERSISTENCE_MODE=file`.

## Rotina operacional minima

### 1) Rotacao periodica de chaves

- Frequencia sugerida (SUPOSICAO): a cada 30 dias.
- Comandos:
  - `npm run keys:list`
  - `npm run keys:rotate -- <key_id> <novo_nome>`
  - `npm run keys:revoke -- <key_id_antiga>`
- Validar:
  1. Nova chave autentica `GET /v1/health`.
  2. Chave antiga retorna `401 auth_invalid`.

### 2) Backup de `data/` (quando usar modo `file`)

- Arquivos criticos:
  - `data/api-keys.json`
  - `data/disposable_domains.txt`
  - `data/disposable_domains.version`
  - `data/rate-limit-state.json` (se `RATE_LIMIT_PERSISTENCE_MODE=file`)
  - `data/usage-state.json` (se `USAGE_PERSISTENCE_MODE=file`)
- Frequencia sugerida (SUPOSICAO): diario.
- Validar:
  1. Restaurar backup em ambiente de teste.
  2. Rodar `npm run verify` apos restauracao.

### 3) Procedimento de incidente: `rate_limited`

1. Confirmar codigo `429` e header `retry-after`.
2. Verificar configuracao `RATE_LIMIT_*`.
3. Se ataque/abuso: revogar/rotacionar chave afetada.
4. Registrar incidente em `docs/changes.md`.

### 4) Procedimento de incidente: `provider_unavailable`

1. Confirmar se `ENABLE_PROVIDER=true`.
2. Validar `PROVIDER_BASE_URL`, `PROVIDER_PATH`, timeout e retries.
3. Se o provedor estiver instavel: desabilitar integracao (`ENABLE_PROVIDER=false`) para manter core local.
4. Executar `npm run verify` para confirmar estabilidade local.

### 5) Verificacao continua

- Antes de release:
  - `npm test`
  - `npm run verify`
- Em producao (deploy):
  - executar smoke test com os 6 `curl` do README.
  - opcional: `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy`
  - validar `request_id` em respostas de erro.

## Evidencia de execucao (2026-02-08)

- Drill de chaves executado com arquivo temporario dedicado:
  - create -> rotate -> revoke -> list: OK.
- Drill de backup/restore executado com comparacao de hash SHA-256:
  - `hash_match=true`.
- Validacoes tecnicas executadas:
  - `npm test`: OK
  - `npm run verify`: OK
  - `docker build -t mailsieve:local .`: OK
  - smoke Docker sem auth (`/v1/health`): `401` esperado

## COMO VALIDAR

1. Reexecutar os comandos deste runbook em ambiente local.
2. Simular falha de provedor e limite de taxa.
3. Confirmar recuperacao sem downtime do core local.
4. Registrar o resultado em `docs/changes.md`.