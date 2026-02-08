# Error Model

## FATOS (da fonte validada)

- API deve usar um modelo único de erro.
- `401` para auth missing/invalid.
- `429` para rate-limit.

## SUPOSIÇÕES (schema único adotado)

```json
{
  "error": {
    "code": "string_estavel",
    "message": "mensagem clara",
    "details": [
      { "field": "campo", "reason": "motivo" }
    ],
    "request_id": "uuid"
  }
}
```

### Códigos estáveis usados

- `auth_missing`
- `auth_invalid`
- `invalid_request`
- `invalid_json`
- `not_found`
- `rate_limited`
- `internal_error`
- `provider_unavailable`

### Mapeamento HTTP

- `400`: `invalid_request` / `invalid_json`
- `401`: `auth_missing` / `auth_invalid`
- `404`: `not_found`
- `429`: `rate_limited`
- `500`: `internal_error` / `provider_unavailable`

## COMO VALIDAR (passos práticos)

1. Enviar request sem `x-api-key` e confirmar `401 auth_missing`.
2. Enviar JSON inválido e confirmar `400 invalid_json`.
3. Exceder limite e confirmar `429 rate_limited`.
4. Configurar provedor opcional inválido e confirmar `500 provider_unavailable`.
5. Chamar rota inexistente e confirmar `404 not_found`.
6. Confirmar presença de `request_id` em todos os erros.
