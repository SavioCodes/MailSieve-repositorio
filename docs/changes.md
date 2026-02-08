# Changes

## 2026-02-08

### Audit inicial

- Projeto ja existia com base funcional e documentacao parcial.
- Havia duplicacao de arquivos (`.js` legados junto de `.ts`, e testes `.ts`/`.js` em paralelo).
- `/v1/health` estava sem autenticacao e API keys em texto puro.

### Atualizacoes aplicadas (sem criar endpoints extras)

- Mantidos somente 3 endpoints publicos:
  - `GET /v1/health`
  - `POST /v1/generate`
  - `POST /v1/batch`
- `x-api-key` obrigatoria em todos os 3 endpoints.
- Migracao de API keys para `hash+salt` no arquivo `data/api-keys.json`.
- Scripts de chave atualizados para operar por `key_id`:
  - `keys:create`, `keys:revoke`, `keys:list`, `keys:rotate`.
- Error Model unificado com codigos estaveis:
  - `auth_missing`, `auth_invalid`, `invalid_request`, `invalid_json`, `rate_limited`, `internal_error`, `provider_unavailable`.
- Rate-limit e metricas agora identificam por `key_id` (sem segredo bruto).
- Pipeline MailSieve reforcado com:
  - checagem de sufixos de dominio disposable,
  - cache de dominio com TTL,
  - MX check opcional com cache.
- OpenAPI/README/docs/rapidapi-pack sincronizados com o comportamento atual.

### Limpeza de duplicacao

- Removidos arquivos legados duplicados de `src/` e `tests/` que nao eram fonte ativa.
- Mantida estrutura unica em TypeScript para backend e testes JS offline sobre `dist`.

### Compatibilidade

- `apiKeyService` mantem leitura de formato legado com `key` em claro para migracao gradual, mas novo padrao grava apenas `hash+salt`.

## 2026-02-08 (atualizacao de conformidade)

### Antes -> Depois

- Antes: env principal usava `JSON_BODY_LIMIT`, `PROCESSING_TIMEOUT_MS` e `BATCH_MAX_CONCURRENCY`.
- Depois: defaults passaram a `BODY_SIZE_LIMIT=64kb`, `REQUEST_TIMEOUT_MS=3000`, `BATCH_CONCURRENCY=5` (com fallback compativel para nomes antigos).

### Mudancas aplicadas

- `provider_unavailable` agora retorna via Error Model (`500`) quando o provedor opcional esta configurado e indisponivel.
- `openapi.yaml` atualizado para respostas `500` e `provider_status` de sucesso (`disabled|ok`).
- Adicionados docs extras obrigatorios:
  - `docs/idea-and-code-explained.md`
  - `docs/publishing-and-getting-paid.md`
- README e docs alinhados aos novos nomes de env e ao comportamento de erro do provedor.

### Impacto

- Sem novos endpoints publicos.
- Sem dependencias externas obrigatorias.
- Testes continuam offline.

## 2026-02-08 (hardening final de producao)

### Antes -> Depois

- Antes: `report:usage` e `update:disposable-list` falhavam por BOM na linha de shebang.
- Depois: scripts executam corretamente em Node sem erro de parsing.

### Mudancas aplicadas

- Removido BOM de arquivos de texto do projeto (UTF-8 sem BOM).
- Criado `npm run verify` com script `scripts/verify_e2e.js`:
  - sobe servidor local,
  - valida `200` (`health`, `generate`, `batch`),
  - valida erros `401`, `400`, `429`,
  - falha com exit code diferente de zero quando necessario.
- Error Model ampliado com `not_found` e fallback `404` padronizado na aplicacao.
- Novos testes:
  - `tests/invalidRequest.test.js`
  - `tests/notFound.test.js`
- Itens de producao adicionados:
  - `LICENSE` (MIT, suposicao documentada),
  - CI em `.github/workflows/ci.yml`.
  - repositorio Git inicializado (`git init -b main`).
- Novos documentos:
  - `docs/index.md`
  - `docs/runbook-local.md`
  - `docs/prompt1-source.md`

### Impacto

- API permanece com os mesmos 3 endpoints publicos.
- Melhor cobertura de validacao e operacao.
- Verificacao ponta-a-ponta automatizada disponivel no ciclo local e no CI.

## 2026-02-08 (fix ambiente Docker/WSL)

### Antes -> Depois

- Antes: Docker Desktop nao iniciava, bloqueando validacao de runtime em container.
- Depois: Docker daemon funcional e validacao ponta a ponta em container concluida.

### Mudancas aplicadas

- Atualizado WSL para versao `2.6.3.0` (kernel `6.6.87.2`).
- Corrigida descoberta de plugins Docker CLI (`sandbox`).
- Ajustado arquivo de settings do Docker para evitar quebra de parse por BOM.
- Validado:
  - `docker info` OK,
  - `docker build -t mailsieve:local .` OK,
  - smoke local em container OK (`health`, `generate`, `batch`, `401`).

### Impacto

- Runtime Docker agora operacional no ambiente local.
- Validacao de deploy local concluida.

## 2026-02-08 (finalizacao interna sem dependencia externa)

### Antes -> Depois

- Antes: havia pendencias internas de seguranca operacional e consistencia de documentacao.
- Depois: pendencias internas fechadas; sobraram apenas itens externos nao executaveis sem credenciais/fonte adicional.

### Mudancas aplicadas

- `data/api-keys.json` agora inicia sem chave ativa padrao (evita segredo de desenvolvimento reutilizavel por padrao).
- `README.md` atualizado para exigir geracao de chave antes dos exemplos `curl`.
- `scripts/export_usage_report.js` melhorado para sempre gerar JSON (mesmo sem estado de uso), evitando fluxo parcial.
- Documentacao normalizada em ASCII para evitar texto corrompido em ambientes com encoding diferente.
- Criado/atualizado checklist de fechamento em `docs/tasks-finalizacao.md`.

### Impacto

- Seguranca melhor para primeira inicializacao.
- Operacao mais previsivel para automacao de relatorios.
- Menos risco de erro por encoding na documentacao.
## 2026-02-08 (evidencias de fechamento)

### FATOS

- Testes executados apos ajustes finais:
  - `npm test` -> OK
  - `npm run verify` -> OK
  - `npm run report:usage` -> OK
  - `docker build -t mailsieve:local .` -> OK
- Drill operacional local executado:
  - keys: create -> rotate -> revoke -> list (OK)
  - backup/restore `data/` com comparacao SHA-256 (hash match: true)

### SUPOSICOES

- Pendencias externas (deploy publico e fonte completa do Prompt 1) dependem de dados/credenciais fora do workspace.

### COMO VALIDAR

1. Reexecutar `npm test` e `npm run verify`.
2. Reexecutar `npm run report:usage` e confirmar `reports/usage-report.json`.
3. Reexecutar build Docker.
4. Verificar pendencias externas em `docs/tasks-finalizacao.md`.

## 2026-02-08 (auditoria final completa)

### FATOS

- Auditoria full executada no workspace com validacoes locais:
  - `npm test` -> OK
  - `npm run verify` -> OK
  - `npm run report:usage` -> OK
  - `npm run update:disposable-list` -> OK (sem URL, retorna mensagem clara)
  - `docker build -t mailsieve:local .` -> OK
- Runtime Docker validado com chamadas HTTP reais em container:
  - `GET /v1/health` com auth -> `200`
  - `POST /v1/generate` com auth -> `200`
  - `POST /v1/batch` com auth -> `200`
  - `POST /v1/generate` sem auth -> `401`
- Confirmado novamente: apenas 3 endpoints publicos no codigo e no `openapi.yaml`.
- `git status` limpo apos auditoria.

### SUPOSICOES

- Nao ha como concluir publicacao real na RapidAPI sem acesso de conta/painel.
- Nao ha como completar a fonte integral do Prompt 1 sem o texto integral fornecido pelo usuario.

### COMO VALIDAR

1. Reexecutar os comandos tecnicos listados nesta secao.
2. Publicar em host publico real e rodar `npm run smoke:deploy`.
3. Inserir o texto integral em `docs/prompt1-source.md`.

## 2026-02-08 (fonte consolidada com pesquisa publica)

### FATOS

- `docs/prompt1-source.md` foi reescrito com base em fontes publicas verificaveis:
  - busca/curadorias da RapidAPI,
  - monetizacao e payout da RapidAPI,
  - repositorio CC0 de dominios descartaveis,
  - limites/pricing de Cloudflare Workers.
- O novo arquivo separa `FATOS`, `INFERENCIAS`, `PROPOSTA`, `SUPOSICOES` e `NAO CONFIRMADO`.

### SUPOSICOES

- A nova versao fecha rastreabilidade tecnica da ideia, mas nao e transcricao literal do texto integral original do Prompt 1.

### COMO VALIDAR

1. Abrir `docs/prompt1-source.md` e conferir links/referencias.
2. Revisar rapidamente se os fatos listados batem com as paginas oficiais.

## 2026-02-08 (deploy publico validado)

### FATOS

- Deploy publico ativo no Render:
  - `https://mailsieve-repositorio.onrender.com`
- Validacao do endpoint publico:
  - `GET /v1/health` com `x-api-key` retornou `200`.
- Smoke test de deploy executado com sucesso:
  - `BASE_URL=https://mailsieve-repositorio.onrender.com API_KEY=<key_ativa> npm run smoke:deploy`
  - retorno: `OK: smoke deploy passou`.

### SUPOSICOES

- Plano Free pode entrar em hibernacao e atrasar o primeiro request apos inatividade.

### COMO VALIDAR

1. Repetir o comando `npm run smoke:deploy` com `BASE_URL` e `API_KEY` validos.
2. Conferir logs de runtime no painel do Render.

## 2026-02-08 (ajuste smoke deploy no Windows)

### FATOS

- `scripts/smoke_deploy.js` foi ajustado para nao forcar `process.exit(1)` em erro.
- Com isso, em ambiente Windows, o comando deixa de exibir o erro:
  - `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\\win\\async.c, line 76`
- O script continua retornando exit code `1` quando falha e `0` quando passa.

### SUPOSICOES

- O problema era efeito colateral de encerramento forcado do processo com handles async ainda abertos.

### COMO VALIDAR

1. Executar `npm run smoke:deploy` com chave invalida e confirmar:
   - erro de auth exibido,
   - sem mensagem de assertion do Node.
2. Executar novamente com chave valida e confirmar:
   - `OK: smoke deploy passou`.

## 2026-02-08 (README: comandos PowerShell corrigidos)

### FATOS

- README atualizado para evitar erro comum no PowerShell:
  - `curl` (alias de `Invoke-WebRequest`) -> agora documentado para usar `curl.exe`.
- Exemplos de request agora usam `BASE_URL` (bash) e `$env:BASE_URL` (PowerShell), evitando placeholder vazio.
- Adicionados exemplos PowerShell completos para:
  - health,
  - generate,
  - batch,
  - auth faltando,
  - request invalida,
  - rate-limit.

### SUPOSICOES

- O shell principal de operacao para usuarios Windows sera PowerShell.

### COMO VALIDAR

1. Definir no PowerShell:
   - `$env:BASE_URL`
   - `$env:API_KEY`
2. Executar os exemplos da secao "6 exemplos curl".
3. Confirmar codigos esperados (`200`, `400`, `401`, `429`).

## 2026-02-08 (consolidacao documental profissional)

### FATOS

- Documentacao reorganizada para padrao unico e consistente:
  - `docs/overview.md` reescrito com arquitetura e validacao pratica.
  - `docs/decisions.md` reescrito com decisoes tecnicas e defaults.
  - `docs/publishing-and-getting-paid.md` reescrito com fluxo objetivo de publicacao.
  - `docs/tasks-finalizacao.md` reescrito para separar baseline tecnico e passos manuais externos.
  - `docs/index.md` ajustado para refletir leitura e status final.
- README mantido com exemplos de PowerShell e bash, incluindo observacao de `curl.exe` no Windows.

### SUPOSICOES

- O repositorio ja esta tecnicamente pronto para release; passos restantes sao operacionais (painel/conta).

### COMO VALIDAR

1. Ler `docs/index.md` e conferir ordem de leitura.
2. Rodar `npm test` e `npm run verify`.
3. Rodar `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy` no ambiente publico.
