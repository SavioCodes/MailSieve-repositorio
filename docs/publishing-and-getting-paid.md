# Publishing And Getting Paid

## FATOS (da fonte validada)

- Há referências públicas da RapidAPI para monetização e limites de free plan (consultar docs oficiais).
- Há referência de fee de marketplace (25%) e payout via PayPal, com taxas variáveis por país.
- Não existe ranking oficial aberto de demanda por categoria.

## O que precisa estar pronto no repositório

- `openapi.yaml` com apenas 3 endpoints (`/v1/health`, `/v1/generate`, `/v1/batch`).
- README com auth, exemplos curl, docker e notas de custo.
- `npm run verify` passando no ambiente local/CI.
- `rapidapi-pack/` completo:
  - `listing.md`
  - `pricing-template.md`
  - `terms-template.md`
  - `privacy-template.md`
  - `publish-checklist.md`

## Passo a passo de publicação (prático)

1. Criar listing da API na RapidAPI.
2. Importar `openapi.yaml`.
3. Configurar autenticação por header `x-api-key` conforme contrato.
4. Definir planos/quotas comerciais com placeholders.
5. Testar no playground da plataforma.
6. Publicar e monitorar uso/erros.
7. Rodar smoke test pós-deploy (6 curls do README + runbook).

## VERIFICAR NA DOC (itens oficiais)

- Publicação do provider/listing:
  - buscar: `RapidAPI provider publish API`
- Monetização e planos:
  - buscar: `RapidAPI monetizing your api`
- Payout, fee e PayPal:
  - buscar: `RapidAPI payouts calculated PayPal marketplace fee`
- Políticas gerais:
  - buscar: `RapidAPI policy security privacy`

## Como “pegar as coisas” no seu projeto

### Gerar e gerenciar API keys

- `npm run keys:create -- <nome>`
- `npm run keys:list`
- `npm run keys:revoke -- <key_id>`
- `npm run keys:rotate -- <key_id> [novo_nome]`

### Entender uso

- `npm run report:usage`
- saída: `reports/usage-report.json`

## Payout (sem inventar)

- Referência de fonte: payout via PayPal e fee de marketplace constam na fonte validada.
- Taxas variam por país/conta.
- Procedimento: confirmar valores e regras atuais diretamente no painel e docs oficiais da RapidAPI e PayPal.

## O que anotar após publicar

- Views do listing.
- Taxa de conversão (trial/free -> plano pago).
- Churn/cancelamento.
- Erros por código (`auth_invalid`, `rate_limited`, `invalid_request`, `provider_unavailable`).
- Latência média e p95 por período.

## SUPOSIÇÕES

- Estratégia de preço final depende do custo do host escolhido.
- Quotas comerciais devem ser ajustadas após dados reais de tráfego.

## COMO VALIDAR (passos práticos)

1. Seguir checklist em `rapidapi-pack/publish-checklist.md`.
2. Revisar links oficiais antes de publicar planos/payout.
3. Simular onboarding de consumidor com OpenAPI importada.
