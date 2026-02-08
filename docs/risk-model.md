# Risk Model

## FATOS (da fonte validada)

- Core: detectar disposable e fornecer risco lite explicável.
- Resposta inclui `signals` e `risk_level`.

## SUPOSIÇÕES (regras adotadas)

### Sinais (`signals`)

- `disposable_domain`: domínio na lista local CC0.
- `role_based_local_part`: local-part em lista role-based (`admin`, `support` etc.).
- `typo_suspect_domain`: domínio em lista de typo suspeito.
- `mx_missing_or_unresolvable`: sem MX (somente se `ENABLE_MX_CHECK=true`).

### Nível de risco (`risk_level`)

- `high`: quando `disposable_domain`.
- `medium`: quando existe sinal lite relevante (`role_based_local_part`, `typo_suspect_domain`, `mx_missing_or_unresolvable`).
- `low`: quando nenhum sinal relevante.

### Meta

- `list_version`: versão da lista local.
- `cache_hit`: cache de domínio/MX.
- `processing_ms`: latência de processamento.
- `provider_status`: `disabled | ok`.

## Limitações conhecidas

- Heurísticas simples podem gerar falso positivo/negativo.
- Checagem de sufixo de domínio favorece detecção em subdomínios, com risco de excesso em casos raros.
- MX check depende do ambiente de rede/DNS.

## COMO VALIDAR (passos práticos)

1. Usar `mailinator.com` e confirmar `disposable_domain` + `risk_level=high`.
2. Usar `admin@gmail.com` e confirmar `role_based_local_part` + `risk_level=medium`.
3. Habilitar `ENABLE_MX_CHECK=true` e testar domínio sem MX.
