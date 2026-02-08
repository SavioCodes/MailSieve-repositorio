# API Contract

## FATOS (da fonte validada)

- Endpoints públicos permitidos (somente):
  - `GET /v1/health`
  - `POST /v1/generate`
  - `POST /v1/batch`
- Autenticação por `x-api-key` é obrigatória.

## SUPOSIÇÕES (contrato mínimo definido)

- Todos os 3 endpoints exigem `x-api-key`, incluindo `health`.
- `POST /v1/generate` recebe um e-mail.
- `POST /v1/batch` recebe lista de e-mails com limite configurável (`BATCH_MAX_ITEMS`).
- Modelo de resposta inclui `is_disposable`, `risk_level`, `signals` e `meta`.
- Quando provedor opcional está configurado e indisponível, retorna erro `provider_unavailable` no Error Model.

## Contratos

### GET `/v1/health`

Request headers:
- `x-api-key: string`

Response `200`:
```json
{
  "status": "ok",
  "name": "MailSieve",
  "version": "0.2.0",
  "uptime_s": 123
}
```

### POST `/v1/generate`

Request JSON:
```json
{
  "email": "user@example.com"
}
```

Response `200`:
```json
{
  "email": "user@example.com",
  "normalized_email": "user@example.com",
  "domain": "example.com",
  "is_disposable": false,
  "risk_level": "low",
  "signals": [],
  "meta": {
    "list_version": "2026-02-08",
    "cache_hit": false,
    "processing_ms": 3,
    "provider_status": "disabled"
  }
}
```

### POST `/v1/batch`

Request JSON:
```json
{
  "emails": ["a@example.com", "b@example.com"],
  "concurrency": 2
}
```

Response `200`:
```json
{
  "results": [
    {
      "email": "a@example.com",
      "normalized_email": "a@example.com",
      "domain": "example.com",
      "is_disposable": false,
      "risk_level": "low",
      "signals": [],
      "meta": {
        "list_version": "2026-02-08",
        "cache_hit": false,
        "processing_ms": 2,
        "provider_status": "disabled"
      }
    }
  ]
}
```

## Erros padronizados

Ver `docs/error-model.md`.

### Rota inexistente

SUPOSIÇÃO: qualquer rota fora das três públicas retorna `404` com Error Model (`code=not_found`).

## COMO VALIDAR (passos práticos)

1. Executar `npm start`.
2. Testar os 3 endpoints com `curl` e `x-api-key`.
3. Testar `GET /v1/nao-existe` e confirmar `404 not_found`.
4. Comparar respostas com `openapi.yaml`.
