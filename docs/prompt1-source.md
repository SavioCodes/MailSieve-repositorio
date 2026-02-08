# Prompt 1 Source

Status: fonte consolidada com pesquisa publica em 2026-02-08 (sem inventar dados nao confirmados).

## FATOS (confirmados por fonte publica)

1. Existe busca da RapidAPI com ordenacao por tendencia (`sortBy=ByTrending`).  
   Fonte: [RapidAPI Search](https://rapidapi.com/search?sortBy=ByTrending&utm_source=chatgpt.com)
2. Existe curadoria publica da RapidAPI para Email Validation/Verification.  
   Fonte: [Top Email Validation and Verification APIs](https://rapidapi.com/collection/email-validation-verification-api?utm_source=chatgpt.com)
3. Existe curadoria publica da RapidAPI para Security APIs.  
   Fonte: [Top Security APIs](https://rapidapi.com/collection/list-of-security-apis?utm_source=chatgpt.com)
4. A documentacao de monetizacao da RapidAPI traz referencia de limites de free plan e exemplo de estrutura de planos/precos.  
   Fonte: [Monetizing Your API on rapidapi.com](https://docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom)
5. A documentacao de payout da RapidAPI informa fee de marketplace de 25% e payout via PayPal (USD), com observacao de taxa PayPal variavel por pais.  
   Fonte: [How are payouts calculated?](https://rapidapi.zendesk.com/hc/en-us/articles/19308532866068-How-are-payouts-calculated)
6. O repositorio `di/martenson-disposable-email-domains` informa licenca CC0 e lista de dominios descartaveis.  
   Fonte: [GitHub repo](https://github.com/di/martenson-disposable-email-domains)
7. A documentacao da Cloudflare Workers informa limites do plano Free e referencia de precificacao do plano pago.  
   Fontes:
   - [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
   - [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## INFERENCIAS (derivadas dos fatos, sem afirmar como dado interno)

1. Curadorias de Email e Security indicam relevancia editorial desses temas dentro do marketplace.
2. Para MVP de baixo custo, uma API de lookup local (lista + cache + heuristicas leves) tende a custo operacional previsivel.
3. Diferenciacao por explicabilidade (`signals`) pode reduzir comoditizacao frente a respostas apenas booleanas.

## PROPOSTA CONSOLIDADA (com base na pesquisa)

- Nome final: **MailSieve**.
- Produto: detector de e-mail descartavel + risco "lite" (sem SMTP).
- Operacao principal: local/offline por padrao (lista CC0 + cache + heuristicas explicaveis).
- Integracao de provedor/modelo: opcional e generica; nao obrigatoria para o core.

## SUPOSICOES (necessarias por ausencia de definicao explicita)

1. Contrato HTTP detalhado de `/v1/generate` e `/v1/batch` foi definido localmente para manter consistencia tecnica.
2. Valores default de rate limit, timeout, batch e TTL foram parametrizados por `.env` como baseline conservador.
3. Politica de retencao operacional foi definida como configuravel para evitar dependencia de regra fixa nao documentada na fonte.

## NAO CONFIRMADO (e como validar)

1. Ranking oficial publico por receita/assinantes por categoria na RapidAPI.  
   Como validar: revisar periodicamente docs oficiais e painel de provider da RapidAPI.
2. Custos/limites/schema de qualquer provedor "gptcodex 5.2/5.3".  
   Como validar: usar apenas documentacao oficial do provedor escolhido quando estiver disponivel.
3. Texto literal completo do "Prompt 1" original do usuario.  
   Como validar: anexar o texto integral original se houver necessidade de rastreabilidade juridica/documental literal.

## REFERENCIAS

- https://rapidapi.com/search?sortBy=ByTrending&utm_source=chatgpt.com
- https://rapidapi.com/collection/email-validation-verification-api?utm_source=chatgpt.com
- https://rapidapi.com/collection/list-of-security-apis?utm_source=chatgpt.com
- https://docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom
- https://rapidapi.zendesk.com/hc/en-us/articles/19308532866068-How-are-payouts-calculated
- https://github.com/di/martenson-disposable-email-domains
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
