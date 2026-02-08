# Tasks de Finalizacao do MailSieve

Ultima atualizacao: 2026-02-08

## Status geral

- Baseline tecnico local: **CONCLUIDO**.
- Pendencias de codigo abertas: **nenhuma**.
- Pendencias operacionais/comerciais: **somente execucao manual fora do repo**.

## FATOS (confirmados no workspace)

- `npm test` passando (8 suites / 10 testes).
- `npm run verify` passando.
- `npm run report:usage` passando.
- `docker build -t mailsieve:local .` passando.
- Apenas 3 endpoints publicos no codigo e no OpenAPI:
  - `GET /v1/health`
  - `POST /v1/generate`
  - `POST /v1/batch`
- `rapidapi-pack/` completo.
- `docs/` completo e organizado.

## SUPOSICOES

- Publicacao comercial final depende de passos manuais no painel da RapidAPI.
- Deploy publico exige sincronia de chave ativa com o ultimo deploy.

## Checklist de encerramento tecnico

- [x] Auth `x-api-key` nos 3 endpoints.
- [x] Error model unico em 400/401/404/429/500.
- [x] Rate-limit com janela + burst + cooldown.
- [x] Core disposable/risk funcionando offline.
- [x] Testes offline passando.
- [x] Verify E2E local passando.
- [x] Docker build funcional.
- [x] OpenAPI coerente com o codigo.

## Itens finais manuais (fora do repo)

1. Confirmar chave ativa no ambiente publico e rodar smoke:
   - `BASE_URL=<url-publica> API_KEY=<key-ativa> npm run smoke:deploy`
2. Publicar listing na RapidAPI usando `rapidapi-pack/`.
3. Registrar no `docs/changes.md` a data/hora da validacao final apos publicacao.

## Como validar (passos praticos)

1. `npm test`
2. `npm run verify`
3. `npm run report:usage`
4. `docker build -t mailsieve:local .`
5. `npm run keys:list` e confirmar ao menos 1 key ativa para ambiente alvo.
