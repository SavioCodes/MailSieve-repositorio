# MailSieve

## Nome da API

MailSieve

## Descrição curta

API para detecção de domínio de e-mail descartável e classificação de risco lite com sinais explicáveis (`signals`). Funciona localmente sem dependência externa obrigatória.

## Casos de uso

- Filtrar cadastro com domínio descartável.
- Reduzir abuso em signup com risco inicial.
- Priorizar revisão manual com base em sinais explicáveis.

## Autenticação

- Header obrigatório: `x-api-key`.
- Aplicado também ao endpoint de health.

## Limites e quotas

- Limites técnicos parametrizados por env (`RATE_LIMIT_*`).
- Quotas comerciais para marketplace: **SUPOSIÇÃO** (definir no momento de publicação).

## Erros comuns e soluções

- `auth_missing` (401): incluir `x-api-key` no header.
- `auth_invalid` (401): usar chave ativa ou rotacionar chave comprometida.
- `invalid_request` (400): ajustar payload conforme `openapi.yaml`.
- `rate_limited` (429): aguardar `retry-after` e revisar limites.
