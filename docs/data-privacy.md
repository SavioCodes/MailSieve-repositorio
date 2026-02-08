# Data Privacy

## FATOS (da IDEIA VALIDADA)

- O projeto deve funcionar localmente e evitar dependência externa obrigatória.
- A proposta inclui explicabilidade e métricas de uso.

## SUPOSIÇÕES (política técnica adotada)

- Por padrão, não armazenamos e-mail bruto em métricas.
- Armazenamos apenas dados agregados por `key_id`.
- API keys persistidas com `hash+salt`, sem segredo em claro.
- Retenção de métricas configurável por `USAGE_RETENTION_MS`.

## Dados persistidos por padrão

- `data/api-keys.json`: metadados de chave + hash/salt.
- `data/disposable_domains.*`: base local CC0 e versão.
- `data/usage-state.json` e `data/rate-limit-state.json` somente se modo `file`.

## Itens sensíveis e cuidados

- `x-api-key` nunca deve ir para log.
- Rotacionar chaves comprometidas (`keys:rotate`).
- Limpar arquivos de estado em ambientes compartilhados quando necessário.

## COMO VALIDAR (passos práticos)

1. Inspecionar `data/api-keys.json` e confirmar ausência de segredo puro.
2. Gerar tráfego e verificar que relatório não contém e-mails brutos.
3. Ajustar `USAGE_RETENTION_MS` e confirmar poda de eventos.
