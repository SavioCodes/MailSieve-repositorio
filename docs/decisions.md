# Decisions

Ultima atualizacao: 2026-02-08

## FATOS (da fonte validada)

- Core do produto: deteccao disposable + risco lite, sem SMTP.
- Lista local CC0 e parte obrigatoria do escopo.
- Provedor externo nao pode ser dependencia obrigatoria do core.

## SUPOSICOES (escolhas de engenharia)

- Linguagem: TypeScript, para reduzir erro de contrato e melhorar manutencao.
- Runtime: Node 20+ (padrao de projeto e `engines` no `package.json`).
- Persistencia padrao: arquivo local (`data/`) para custo zero local.
- Contratos HTTP: definidos localmente por falta de schema explicito na fonte.

## Dependencias e motivo

- `express`: API HTTP.
- `helmet`: headers basicos de seguranca.
- `cors`: controle de origem.
- `zod`: validacao de env e payload.
- `pino`: logging estruturado.
- `jest` + `supertest`: testes offline de contrato e comportamento.
- `typescript` + `tsx`: build e execucao em desenvolvimento.

## Defaults tecnicos adotados

- `BODY_SIZE_LIMIT=64kb`
- `REQUEST_TIMEOUT_MS=3000`
- `BATCH_MAX_ITEMS=50`
- `BATCH_CONCURRENCY=5`
- `DOMAIN_CACHE_TTL_MS=3600000`
- `MX_CACHE_TTL_MS=21600000`

## Decisoes operacionais

- API keys armazenadas com hash+salt em `data/api-keys.json`.
- Rate-limit e metricas por `key_id` (nao por segredo bruto).
- `providerClient` generico e opcional com timeout/retry/backoff.
- Verificacao E2E automatizada com `npm run verify`.
- CI com `npm test` + `npm run verify`.

## Como validar (passos praticos)

1. `node -v` e confirmar `>=20`.
2. `npm run build`
3. `npm test`
4. `npm run verify`
