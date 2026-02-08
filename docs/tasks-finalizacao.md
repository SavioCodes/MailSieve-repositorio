# Tasks de Finalizacao do MailSieve

Atualizado em: 2026-02-08

## Status geral (verdadeiro, sem omissao)

- Finalizacao tecnica local: **CONCLUIDA**.
- Bloqueios restantes para "100% finalizado para venda": **1 item externo**.
- Nao existem pendencias de codigo/infra local identificadas nesta auditoria.

## Checklist de conclusao

- [x] `npm test` passando.
- [x] `npm run verify` passando.
- [x] `npm run report:usage` funcionando.
- [x] `npm run update:disposable-list` funcionando (modo sem URL retorna mensagem clara).
- [x] `docker build` funcionando.
- [x] runtime Docker validado com chamadas reais:
  - `GET /v1/health` -> 200 com auth
  - `POST /v1/generate` -> 200 com auth
  - `POST /v1/batch` -> 200 com auth
  - `POST /v1/generate` sem auth -> 401
- [x] Apenas 3 endpoints publicos no codigo e no OpenAPI.
- [ ] Deploy publico real validado (bloqueio externo).
- [x] `docs/prompt1-source.md` consolidado com pesquisa publica verificavel.

## Estado atual (checado agora)

- `npm test`: OK (8 suites, 10 testes).
- `npm run verify`: OK.
- `npm run report:usage`: OK (gera JSON mesmo sem estado previo).
- `docker build -t mailsieve:local .`: OK.
- Smoke Docker local (sem auth em `/v1/health`): `401` esperado.
- Endpoints publicos no codigo: somente `GET /v1/health`, `POST /v1/generate`, `POST /v1/batch`.
- OpenAPI: somente os 3 endpoints acima.
- Drill operacional local: keys create/rotate/revoke/list + backup/restore com hash: OK.

## O que ja foi concluido nesta etapa

1. Remocao de chave de desenvolvimento ativa por padrao em `data/api-keys.json`.
2. README atualizado para exigir geracao de chave antes dos exemplos `curl`.
3. `scripts/export_usage_report.js` atualizado para sempre gerar relatorio JSON.
4. Documentacao normalizada para evitar texto corrompido por encoding.
5. Evidencia operacional adicionada em `docs/runbook-local.md` e `docs/changes.md`.

## FATOS

- O codigo, testes, verify e Docker local estao funcionais neste workspace.
- Somente 3 endpoints publicos existem no projeto (`/v1/health`, `/v1/generate`, `/v1/batch`).
- Restam apenas pendencias que dependem de dados externos ao workspace.

## SUPOSICOES

- O fechamento comercial definitivo depende de validacao em um host publico real.
- A rastreabilidade do Prompt 1 foi fechada por consolidacao tecnica baseada em fontes publicas; nao e transcricao literal do texto original do usuario.

## Pendencias restantes (reais)

### P0-1: Validacao de deploy em host real

- Status: PENDENTE
- Motivo real: depende de credenciais/conta de hospedagem que nao existem neste workspace.
- Como fechar:
  1. Escolher host (free tier ou VPS).
  2. Publicar a imagem.
  3. Executar `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy`.
  4. Registrar evidencias em `docs/changes.md`.

### P0-2: Fonte completa do Prompt 1

- Status: CONCLUIDO
- Fechamento aplicado: consolidacao de fonte publica em `docs/prompt1-source.md`, com FATOS, INFERENCIAS, SUPOSICOES e NAO CONFIRMADO.
- Observacao: permanece nao literal ao texto original do Prompt 1; e uma reconstrucao tecnicamente auditavel.

## Itens opcionais (nao bloqueiam fechamento tecnico)

1. Adicionar cobertura minima e threshold no CI.
2. Executar smoke em host publico em mais de uma regiao (quando houver ambiente).

## Checklist final de encerramento

1. Deploy real validado e registrado em `docs/changes.md`.
2. Reexecutar: `npm test`, `npm run verify`, `docker build`.

## COMO VALIDAR

1. Confirmar que `npm test`, `npm run verify` e `docker build` seguem passando.
2. Validar que o P0 de deploy publico foi concluido.
3. Atualizar este arquivo para `Status: CONCLUIDO` quando o deploy publico for fechado.
