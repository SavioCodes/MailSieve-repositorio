# Rate Limit

## FATOS (da IDEIA VALIDADA)

- Rate-limit por `x-api-key` é obrigatório.
- Deve suportar janela + burst + cooldown.
- Implementação padrão deve ser in-memory (custo zero).

## SUPOSIÇÕES (padrão adotado)

- A limitação é aplicada por `key_id` autenticada (não por segredo bruto).
- Estratégia: janela fixa (`window`) + limite base (`max`) + extra (`burst`).
- Se exceder `max + burst`, a chave entra em cooldown por `RATE_LIMIT_COOLDOWN_MS`.

## Variáveis de configuração

- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_BURST`
- `RATE_LIMIT_COOLDOWN_MS`
- `RATE_LIMIT_PERSISTENCE_MODE` (`memory` padrão, `file` opcional)
- `RATE_LIMIT_STATE_FILE` (quando modo `file`)

## Resposta de excesso

- Status: `429`
- Código: `rate_limited`
- Header: `retry-after`

## Trade-off de persistência

- `memory`: mais simples e rápido; perde estado ao reiniciar.
- `file`: mantém estado entre reinícios; pode ter I/O maior.
- `Redis/Postgres` (SUPOSIÇÃO): melhor escala distribuída, mas adiciona custo e operação.

## COMO VALIDAR (passos práticos)

1. Definir limites baixos no `.env`.
2. Fazer requisições repetidas com a mesma chave.
3. Confirmar resposta `429 rate_limited` e `retry-after`.
