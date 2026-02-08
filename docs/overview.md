# Overview

## FATOS (da fonte validada)

- Nome final: `MailSieve`.
- Produto: detector de e-mail descartável com risco "lite" (sem SMTP).
- Diferenciais obrigatórios: `signals` explicáveis, cache e lista local CC0 atualizável.
- Integrações externas pagas: preferência por `0`.
- Integração com provedor/modelo: opcional, genérica e desligada por padrão.

## SUPOSIÇÕES (padrão adotado)

- Contrato HTTP mínimo foi definido localmente porque a fonte não trouxe schema de request/response.
- Stack escolhida: Node.js + TypeScript + Express.
- Persistência padrão: arquivos locais em `data/` para custo zero local.

## Arquitetura resumida

- `src/app.ts`: cria app Express, middlewares e 3 rotas públicas.
- `src/services/mailsieve/*`: pipeline de detecção disposable + risco.
- `src/services/auth/*`: valida `x-api-key` por `hash+salt`.
- `src/services/rateLimit/*`: limite por `key_id` com janela + burst + cooldown.
- `src/services/usage/*`: métricas agregadas por `key_id`.
- `scripts/*`: operações de chave, update da lista e export de relatório.

## Documentação complementar

- `docs/idea-and-code-explained.md`: visão didática de ideia + código.
- `docs/publishing-and-getting-paid.md`: fluxo prático de publicação e operação.
- `docs/runbook-local.md`: rotação de chave, backup e incidentes.
- `docs/prompt1-source.md`: fonte do Prompt 1 disponível no workspace.

## COMO VALIDAR (passos práticos)

1. `npm install`
2. `Copy-Item .env.example .env` (PowerShell) ou `cp .env.example .env`
3. `npm test`
4. `npm run verify`
5. Confirmar que só existem os endpoints `/v1/health`, `/v1/generate`, `/v1/batch`.
