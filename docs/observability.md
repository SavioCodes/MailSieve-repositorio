# Observability

## FATOS (da IDEIA VALIDADA)

- Medição de uso por API key é obrigatória.
- Devem existir contadores de requests, erros e latência.

## SUPOSIÇÕES (implementação atual)

- Coleta por `key_id` autenticada (não por segredo bruto).
- Métricas calculadas em memória e opcionalmente persistidas em arquivo.
- Campos por chave:
  - `requests_total`
  - `errors_total`
  - `latency_avg_ms`
  - `latency_p95_ms`
- Export via script: `npm run report:usage`.

## Logs

Formato mínimo no `pino`:
- `req_id`
- `method`
- `path`
- `status`
- `latency_ms`

Não registra `x-api-key` bruta.

## Relatório de uso

- Saída padrão: `reports/usage-report.json`.
- Janela opcional: `--window-minutes` (SUPOSIÇÃO de interface CLI).

## COMO VALIDAR (passos práticos)

1. Iniciar API com `USAGE_PERSISTENCE_MODE=file`.
2. Gerar tráfego com uma chave válida.
3. Executar `npm run report:usage`.
4. Confirmar `reports/usage-report.json` com métricas agregadas.
