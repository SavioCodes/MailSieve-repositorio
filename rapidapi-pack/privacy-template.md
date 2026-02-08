# Privacy Template

> Aviso: não sou advogado. Este arquivo é um template técnico inicial.

## 1. Dados processados

- Entrada: e-mails enviados pelo cliente.
- Saída: classificação, sinais e metadados técnicos.
- Logs técnicos: `request_id`, status e latência.

## 2. Dados que não devem ser armazenados por padrão

- `x-api-key` em texto puro.
- E-mail bruto em métricas agregadas.

## 3. Retenção (configurável)

- Métricas técnicas podem usar retenção por `USAGE_RETENTION_MS`.
- Definir janela de retenção por exigência legal do negócio.

## 4. Compartilhamento

- Somente com provedores estritamente necessários para operação.

## 5. Direitos do titular

- Definir processo de acesso, correção e exclusão conforme legislação aplicável.
