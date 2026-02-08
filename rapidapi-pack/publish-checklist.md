# Publish Checklist

## Pré-publicação

1. Validar `openapi.yaml` com os 3 endpoints permitidos.
2. Confirmar autenticação `x-api-key` em `/v1/health`, `/v1/generate`, `/v1/batch`.
3. Executar `npm test` offline.
4. Revisar `README.md`, `docs/*` e `rapidapi-pack/*`.
5. Confirmar política de retenção e rotação de chaves.

## VERIFICAR NA DOC (itens dependentes de documentação oficial)

- Publicação da API na RapidAPI:
  - Termos de busca: `RapidAPI provider publish API`.
- Regras de billing e payout:
  - Termos de busca: `RapidAPI payout PayPal marketplace fee`.
- Limites/plans no marketplace:
  - Termos de busca: `RapidAPI pricing plans limits`.
- Política de segurança/compliance:
  - Termos de busca: `RapidAPI security policy privacy`.

## Deploy

1. `docker build -t mailsieve:prod .`
2. Configurar env vars de produção.
3. Executar smoke tests dos 3 endpoints.
4. Monitorar erros 4xx/5xx e latência.
