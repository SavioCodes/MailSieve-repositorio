# Overview

Ultima atualizacao: 2026-02-08

## FATOS (da fonte validada)

- Nome final do produto: `MailSieve`.
- Escopo principal: detector de email descartavel + risco "lite", sem SMTP.
- Diferenciais centrais: `signals` explicaveis, cache e lista local CC0 atualizavel.
- Integracao de provedor externo e opcional; o core deve funcionar offline/local.
- Endpoints publicos permitidos: `/v1/health`, `/v1/generate`, `/v1/batch`.

## SUPOSICOES (padroes adotados)

- Contrato HTTP detalhado foi definido no projeto por ausencia de schema explicito na fonte.
- Stack escolhida: Node.js + TypeScript + Express para consistencia de manutencao.
- Persistencia padrao em arquivo local para custo zero no desenvolvimento.

## Arquitetura resumida

- `src/app.ts`: composicao do app, middlewares e 3 rotas publicas.
- `src/services/auth/*`: validacao de `x-api-key` com hash+salt.
- `src/services/rateLimit/*`: janela + burst + cooldown por `key_id`.
- `src/services/mailsieve/*`: pipeline disposable/risk e sinais explicaveis.
- `src/services/usage/*`: metricas agregadas por `key_id`.
- `scripts/*`: chaves, relatorios, update de lista e verificacao E2E.
- `docs/*`: contrato, seguranca, trade-offs e operacao.

## Como validar (passos praticos)

1. `npm install`
2. `Copy-Item .env.example .env` (PowerShell) ou `cp .env.example .env` (bash)
3. `npm test`
4. `npm run verify`
5. `npm run report:usage`
