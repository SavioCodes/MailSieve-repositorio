# Idea And Code Explained

## FATOS (da fonte validada)

- A RapidAPI não publica ranking oficial aberto por categoria.
- Existem curadorias públicas para Email e Security.
- A proposta escolhida foi detector de e-mail descartável + risco lite (sem SMTP).
- Lista local CC0 é compatível com operação offline.

## O que a API faz (sem marketing)

- Recebe e-mail(s), valida formato básico e normaliza.
- Extrai domínio e verifica se está em lista local de domínios descartáveis.
- Aplica heurísticas simples (`role_based_local_part`, `typo_suspect_domain`, `mx_missing_or_unresolvable`).
- Retorna resultado explicável com `signals`, `risk_level` e `meta`.

## Por que essa ideia foi escolhida

- [INFERÊNCIA da fonte] Resolve problema horizontal de signup/anti-abuso.
- [INFERÊNCIA da fonte] Pode operar com custo previsível e baixo, sem SMTP.
- [FATO da fonte] Existe contexto de curadoria Email/Security na RapidAPI.

## Fluxo técnico (request -> resposta)

1. `requestContext`: gera `request_id` e mede latência.
2. `auth`: valida `x-api-key` por hash+salt.
3. `rateLimit`: aplica janela + burst + cooldown.
4. `routes/schemas`: valida payload com zod.
5. `mailsieveService`: executa pipeline (lista local + heurísticas + cache).
6. `app`: retorna resultado de sucesso ou Error Model padronizado.

## Explicação pasta a pasta

- `src/`: código de runtime da API.
- `src/middleware/`: auth, rate-limit, uso, request context.
- `src/services/mailsieve/`: lógica central do produto.
- `src/services/auth/`: validação de chave por hash.
- `src/services/provider/`: cliente opcional de provedor externo.
- `src/services/usage/`: coleta e agregação de métricas.
- `scripts/`: operações locais (keys, relatório, atualização da lista).
- `data/`: insumos locais (lista CC0, versões, regras simples).
- `tests/`: testes offline automatizados.
- `docs/`: documentação técnica e decisões.
- `rapidapi-pack/`: material de publicação.

## Principais módulos e decisões

- `apiKeyService.ts`: aceita apenas keys ativas; não usa segredo em texto puro.
- `rateLimitService.ts`: in-memory padrão com opção arquivo.
- `mailsieveService.ts`: risco lite explicável, com cache por domínio.
- `providerClient.ts` (SUPOSIÇÃO): integração genérica opcional, sem schema inventado.

## Como alterar regras com segurança

- Role accounts: editar `data/role_based_locals.txt`.
- Domínios typo: editar `data/typo_suspects.json`.
- TTLs e limites: ajustar env (`DOMAIN_CACHE_TTL_MS`, `MX_CACHE_TTL_MS`, `RATE_LIMIT_*`).
- Após alterar: rodar `npm test` e revisar `openapi.yaml` se contrato mudar.

## Limitações (falsos positivos/negativos)

- Lista disposable pode ficar desatualizada se não for atualizada.
- Heurísticas simples são intencionalmente conservadoras.
- MX check pode falhar em ambientes com DNS restrito.

## Checklist de debug

1. Verificar `request_id` no erro e no log.
2. Confirmar env carregado (`BODY_SIZE_LIMIT`, `REQUEST_TIMEOUT_MS`, `RATE_LIMIT_*`).
3. Validar conteúdo em `data/disposable_domains.txt` e `.version`.
4. Rodar requests com payload mínimo para reproduzir.
5. Executar `npm test` para confirmar regressão.

## SUPOSIÇÕES (o que não veio explícito)

- Contratos HTTP detalhados foram definidos localmente.
- Valores default de timeout/limites são parâmetros iniciais e podem mudar.

## COMO VALIDAR (passos práticos)

1. Subir API local e testar os 3 endpoints.
2. Forçar erros (auth/rate-limit/JSON inválido) e confirmar Error Model único.
3. Trocar regras em `data/` e observar mudança em `signals`.
