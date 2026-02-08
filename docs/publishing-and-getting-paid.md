# Publishing And Getting Paid

Ultima atualizacao: 2026-02-08

## FATOS (da fonte validada)

- Existem referencias publicas da RapidAPI para monetizacao e limites de plano free.
- Existe referencia de fee de marketplace (25%) e payout via PayPal (USD), com taxas variaveis por pais.
- Nao existe ranking oficial publico por receita/assinantes por categoria.

## O que precisa estar pronto no repositorio

- `openapi.yaml` com apenas 3 endpoints.
- README com auth, exemplos, docker e operacao.
- `npm test` e `npm run verify` passando.
- `rapidapi-pack/` completo.

## Passo a passo pratico de publicacao

1. Criar listing na RapidAPI.
2. Importar `openapi.yaml`.
3. Configurar auth por header `x-api-key`.
4. Definir planos e quotas (placeholders, sem inventar valores).
5. Testar no playground.
6. Publicar.
7. Rodar smoke test no endpoint publico:
   - `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy`

## VERIFICAR NA DOC (itens oficiais)

- Publicacao provider/listing:
  - buscar: `RapidAPI provider publish API`
- Monetizacao e planos:
  - buscar: `RapidAPI monetizing your api`
- Payout, fee e PayPal:
  - buscar: `RapidAPI payouts calculated PayPal marketplace fee`
- Politicas gerais:
  - buscar: `RapidAPI policy security privacy`

## Operacao de chave no seu projeto

- `npm run keys:create -- <nome>`
- `npm run keys:list`
- `npm run keys:revoke -- <key_id>`
- `npm run keys:rotate -- <key_id> <novo_nome>`

Nota operacional:
- Sempre que `data/api-keys.json` mudar em producao, faca novo deploy e revalide `smoke:deploy`.

## Como validar (passos praticos)

1. Publicar nova versao.
2. Rodar `smoke:deploy` com chave ativa.
3. Confirmar respostas esperadas (`200`, `400`, `401`, `429`).
4. Registrar evidencia em `docs/changes.md`.
