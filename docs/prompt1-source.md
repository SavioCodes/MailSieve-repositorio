# Prompt 1 Source

## FATOS (fonte recebida no workspace)

- O texto completo do Prompt 1 NAO foi fornecido integralmente neste workspace.
- Apenas um trecho parcial foi disponibilizado.
- O projeto deve manter comportamento funcional usando somente fatos confirmados e suposicoes explicitadas.

## SUPOSICOES

- Enquanto o texto integral nao for colado aqui, este arquivo permanece parcial.
- Nenhuma informacao fora do trecho abaixo deve ser tratada como fato.

## COMO VALIDAR

1. Localize o texto integral do Prompt 1 usado na validacao da ideia.
2. Substitua este conteudo pelo texto completo, sem cortes.
3. Revalide os documentos que dependem da fonte:
   - `docs/overview.md`
   - `docs/decisions.md`
   - `docs/tradeoffs.md`
   - `docs/publishing-and-getting-paid.md`

---

NAO HA DADOS SUFICIENTES: o texto completo do Prompt 1 nao foi fornecido ao Codex; cole aqui para completar.

## Trecho parcial recebido

[COMECO DA FONTE COMPLETA]
## Resumo executivo (ate 6 pontos)

1. [FATO] A RapidAPI nao publica um "ranking oficial" aberto de demanda por categoria (ex.: receita/assinantes por vertical). O que existe publicamente sao colecoes/curadorias, paginas de busca (ex.: "ByTrending") e sinais por API (pricing, reviews etc.). (Acesso em 08/02/2026). ([RapidAPI][1])
2. [FATO] Ha curadorias explicitas para Email (inclui validacao/verificacao) e Security, o que e um sinal publico de relevancia desses temas dentro do marketplace. (Acesso em 08/02/2026). ([RapidAPI][2])
3. [FATO] A RapidAPI recomenda estrutura de planos e informa limites do free plan (1000 req/h e 500k req/mes) e uma sugestao de precos (BASIC free, PRO $25, ULTRA $75, MEGA $150). (Acesso em 08/02/2026). ([RapidAPI][3])
4. [FATO] Para payout, ha referencia publica de 25% de fee do marketplace e que payout ocorre via PayPal (USD), com taxa PayPal que varia por pais e pode ser ~2% do payout (cap ate $20, conforme artigo). (Acesso em 08/02/2026). ([RapidAPI Support][4])
5. [INFERENCIA] Com restricao de baixo custo + 0-1 integracoes pagas, a melhor aposta tende a ser uma API de validacao/risco leve (lookup + cache), porque o custo por request pode ser muito baixo e previsivel. (Raciocinio detalhado na secao 5). ([RapidAPI][3])
6. [PROPOSTA] Melhor ideia final: detector de e-mail descartavel + risco lite (sem SMTP), com diferenciacao por explicabilidade, cache e atualizacao de lista CC0.

--- (O RESTANTE DA FONTE E O TEXTO COMPLETO DO PROMPT 1. COLE TUDO INTEGRALMENTE AQUI, SEM CORTAR.) ---

[1]: https://rapidapi.com/search?sortBy=ByTrending&utm_source=chatgpt.com
[2]: https://rapidapi.com/collection/email-validation-verification-api?utm_source=chatgpt.com
[3]: https://docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom
[4]: https://rapidapi.zendesk.com/hc/en-us/articles/19308532866068-How-are-payouts-calculated
[14]: https://github.com/di/martenson-disposable-email-domains
[19]: https://developers.cloudflare.com/workers/platform/limits/
[20]: https://developers.cloudflare.com/workers/platform/pricing/
[FIM DA FONTE COMPLETA]