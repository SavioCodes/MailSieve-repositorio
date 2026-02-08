# Security

## FATOS (da fonte validada)

- `x-api-key` obrigatório.
- Sem endpoints extras para administração de chaves.
- Rate-limit obrigatório por chave.

## SUPOSIÇÕES (controles adotados)

- Chaves armazenadas com `hash+salt` em `data/api-keys.json`.
- `health` também exige `x-api-key` para reduzir abuso automatizado.
- Limite de payload JSON configurável (`BODY_SIZE_LIMIT`).
- Timeout de processamento configurável (`REQUEST_TIMEOUT_MS`).
- `helmet` e `cors` habilitados por padrão.
- `request_id` (`uuid`) por requisição.

## Operação de chaves (CLI)

- `npm run keys:create -- <nome_opcional>`
- `npm run keys:revoke -- <key_id>`
- `npm run keys:list`
- `npm run keys:rotate -- <key_id_antiga> [novo_nome]`

Observação: segredo só aparece no `create/rotate`.

## Modelo de erro de segurança

- `401 auth_missing`
- `401 auth_invalid`
- `429 rate_limited`
- `404 not_found`

## COMO VALIDAR (passos práticos)

1. Enviar request sem `x-api-key` e conferir `401 auth_missing`.
2. Enviar `x-api-key` inválida e conferir `401 auth_invalid`.
3. Rodar `npm run keys:list` e validar que não há segredo em texto puro.
4. Verificar logs e confirmar ausência de chave bruta.
5. Seguir `docs/runbook-local.md` para resposta a incidente.
