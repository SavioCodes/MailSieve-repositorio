# Decisions

## FATOS (da fonte validada)

- Core do produto: disposable + risco lite, sem SMTP.
- Lista local CC0 é parte do escopo.
- Provedor externo não pode ser obrigatório para o funcionamento principal.

## SUPOSIÇÕES (padrões escolhidos e por quê)

- **TypeScript**: escolhido para reduzir erro de contrato e melhorar manutenção.
- **Node 20+**: suposição para runtime moderno com `fetch` nativo.
- **Contrato HTTP**: definido como mínimo consistente porque não veio detalhado na fonte validada.
- **Persistência padrão em arquivo**: evita dependências nativas e custo extra.

## Dependências e justificativa

- `express`: servidor HTTP e roteamento.
- `helmet`: headers básicos de segurança.
- `cors`: controle de origem.
- `zod`: validação de payload e env.
- `pino`: log estruturado com `req_id`, status e latência.
- `jest` + `supertest`: testes offline de rotas e contratos.
- `typescript` + `tsx`: build e execução em desenvolvimento.

## Defaults técnicos adotados (SUPOSIÇÃO)

- `BODY_SIZE_LIMIT=64kb`
- `REQUEST_TIMEOUT_MS=3000`
- `BATCH_MAX_ITEMS=50`
- `BATCH_CONCURRENCY=5`
- `DOMAIN_CACHE_TTL_MS=3600000`
- `MX_CACHE_TTL_MS=21600000`

## Decisões de operação

- API keys armazenadas com `hash+salt` em `data/api-keys.json`.
- Rate-limit por `key_id` (não pela chave bruta).
- Métricas agregadas por `key_id`; sem armazenar e-mail bruto por padrão.
- `providerClient` é genérico e opcional, com timeout/retry/backoff.
- Verificação E2E local automatizada com `npm run verify`.
- CI executa `npm test` + `npm run verify` em push/PR.
- Licença do código: MIT (SUPOSIÇÃO até validação jurídica).

## COMO VALIDAR (passos práticos)

1. `node -v` (confirmar Node 20+).
2. `npm run build`.
3. `npm test`.
4. Verificar se `/v1/health` também exige `x-api-key`.
