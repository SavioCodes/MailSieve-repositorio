# MailSieve

MailSieve e uma API HTTP para classificar e-mails de cadastro, detectar dominio descartavel e gerar risco lite explicavel (`signals`). O core funciona localmente, sem SMTP e sem dependencia externa obrigatoria.

## Normalizacao do nome

- Nome exibido: `MailSieve`
- `package.json.name`: `mailsieve`
- Pasta do projeto: `mailsieve`
- OpenAPI title: `MailSieve`

## FATOS (da fonte validada)

- Produto: detector de e-mail descartavel + risco lite.
- Lista local CC0 com atualizacao periodica.
- Integracao com provedor/modelo e opcional e desligada por padrao.

## SUPOSICOES adotadas

- Runtime: Node.js 20+.
- Contratos HTTP definidos localmente por ausencia de schema HTTP explicito na fonte.
- `x-api-key` obrigatoria em todos os endpoints, incluindo health.

## Endpoints publicos (somente estes)

- `GET /v1/health`
- `POST /v1/generate`
- `POST /v1/batch`

## Dependencias minimas e por que

- `express`: API HTTP.
- `helmet`: headers de seguranca basica.
- `cors`: controle de origem.
- `zod`: validacao de payload e env.
- `pino`: logs estruturados.
- `jest` + `supertest`: testes offline.

## Como rodar localmente

PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run build
npm start
```

Bash:

```bash
npm install
cp .env.example .env
npm run build
npm start
```

## Configuracao de ambiente

Arquivo base: `.env.example`.

Variaveis principais:

- `PORT`, `CORS_ORIGIN`, `BODY_SIZE_LIMIT`, `REQUEST_TIMEOUT_MS`
- `API_KEYS_FILE`
- `DISPOSABLE_LIST_FILE`, `DISPOSABLE_LIST_VERSION_FILE`
- `BATCH_MAX_ITEMS`, `BATCH_CONCURRENCY`
- `RATE_LIMIT_*`
- `USAGE_*`
- `ENABLE_PROVIDER`, `PROVIDER_*`

A aplicacao valida env no startup e falha rapido quando invalido.

## API Keys (criar, revogar, rotacionar)

Padrao: `data/api-keys.json` com `hash+salt` (sem segredo em texto puro).

Criar chave:

```bash
npm run keys:create -- chave_operacao
```

Revogar por `key_id`:

```bash
npm run keys:revoke -- key_xxxxxxxxxxxx
```

Listar chaves:

```bash
npm run keys:list
```

Rotacionar por `key_id`:

```bash
npm run keys:rotate -- key_xxxxxxxxxxxx chave_nova
```
  
## 6 exemplos curl

Antes, gere uma chave e exporte.

Bash:

```bash
BASE_URL="http://localhost:3000"
API_KEY="<cole_a_chave_gerada_no_keys:create>"
```

PowerShell:

```powershell
$env:BASE_URL="http://localhost:3000"
$env:API_KEY="<cole_a_chave_gerada_no_keys:create>"
```

No PowerShell, use `curl.exe` (nao `curl`), porque `curl` e alias de `Invoke-WebRequest`.

1. Health:

```bash
curl -s "$BASE_URL/v1/health" \
  -H "x-api-key: $API_KEY"
```

2. Generate (valido):

```bash
curl -s -X POST "$BASE_URL/v1/generate" \
  -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"email":"user@mailinator.com"}'
```

3. Batch (valido):

```bash
curl -s -X POST "$BASE_URL/v1/batch" \
  -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"emails":["um@mailinator.com","dois@gmail.com"],"concurrency":2}'
```

4. Erro de auth:

```bash
curl -s -X POST "$BASE_URL/v1/generate" \
  -H "content-type: application/json" \
  -d '{"email":"user@mailinator.com"}'
```

5. Rate-limit (demonstracao):

```bash
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE_URL/v1/generate" \
    -H "content-type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d '{"email":"user@gmail.com"}'
done
```

6. Request invalida:

```bash
curl -s -X POST "$BASE_URL/v1/generate" \
  -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"email":"invalido"}'
```

Exemplos equivalentes no PowerShell:

```powershell
# 1) health sem auth -> 401
curl.exe -i "$env:BASE_URL/v1/health"

# 2) generate valido -> 200
curl.exe -i -X POST "$env:BASE_URL/v1/generate" `
  -H "x-api-key: $env:API_KEY" `
  -H "content-type: application/json" `
  --data-raw '{"email":"user@mailinator.com"}'

# 3) batch valido -> 200
curl.exe -i -X POST "$env:BASE_URL/v1/batch" `
  -H "x-api-key: $env:API_KEY" `
  -H "content-type: application/json" `
  --data-raw '{"emails":["um@mailinator.com","dois@gmail.com"],"concurrency":2}'

# 4) auth faltando -> 401
curl.exe -i -X POST "$env:BASE_URL/v1/generate" `
  -H "content-type: application/json" `
  --data-raw '{"email":"user@mailinator.com"}'

# 5) request invalida -> 400 (schema)
curl.exe -i -X POST "$env:BASE_URL/v1/generate" `
  -H "x-api-key: $env:API_KEY" `
  -H "content-type: application/json" `
  --data-raw '{"email":"invalido"}'

# 6) rate-limit -> 429 (forcando varias chamadas)
1..120 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST "$env:BASE_URL/v1/generate" `
    -H "x-api-key: $env:API_KEY" `
    -H "content-type: application/json" `
    --data-raw '{"email":"user@gmail.com"}'
}
```

## Testes automatizados

```bash
npm test
```

Os testes rodam offline e cobrem health/auth/generate/rate-limit/providerClient/batch.

## Verificacao ponta-a-ponta (`verify`)

```bash
npm run verify
```

O comando sobe servidor local temporario, usa chave de teste, valida cenarios de sucesso e erro (`401`, `400`, `429`) e retorna exit code diferente de zero quando algo falha.

## OpenAPI

Arquivo: `openapi.yaml`.

Abrir no Swagger Editor:

- Online: `https://editor.swagger.io/`
- Local: qualquer instalacao local do Swagger Editor.

## Scripts de operacao

Atualizar lista disposable (opcional, depende de rede):

```bash
npm run update:disposable-list
```

Exportar uso (JSON):

```bash
npm run report:usage
npm run report:usage -- --window-minutes 60
```

## Docker

Build:

```bash
docker build -t mailsieve:local .
```

Run:

```bash
docker run --rm -p 3000:3000 --env-file .env mailsieve:local
```

## Estrutura do projeto

- `src/`: codigo principal da API.
- `data/`: arquivos locais (lista CC0, chaves, configuracoes de heuristica).
- `scripts/`: operacoes de chaves/lista/relatorios.
- `tests/`: testes offline.
- `docs/`: documentacao tecnica.
- `rapidapi-pack/`: arquivos para publicacao.

Indice de docs: `docs/index.md`.

## Como manter organizado

1. Nao criar copias com sufixos (`_new`, `_old`, `copy`, `final2`).
2. Atualizar `docs/changes.md` em qualquer mudanca relevante.
3. Evitar duplicar conteudo entre README, docs e rapidapi-pack; usar referencia cruzada.
4. Rodar `npm test` antes de publicar alteracoes.

## Deploy low-cost (sem preco inventado)

- Opcao gratuita quando possivel: plataforma com free tier para container Node (validar limites atuais no pricing oficial).
- Opcao VPS barata: VPS Linux + Docker + proxy reverso.
- Alternativa generica: qualquer host Docker.

### Validacao pos-deploy (smoke test)

1. Definir `BASE_URL` publico da API.
2. Executar os 6 `curl` desta secao contra o `BASE_URL`.
3. Confirmar codigos esperados (`200`, `400`, `401`, `429`) e `request_id` em erros.
4. Registrar evidencias no `docs/runbook-local.md` e `docs/changes.md`.
5. Opcional automatizado: `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy`.

## Licenca

- Arquivo: `LICENSE`.
- SUPOSICAO adotada: licenca MIT para o codigo do projeto.
- Como validar: revisao juridica/politica interna antes de publicar comercialmente.

## Notas de custo e trade-offs

- Padrao atual: arquivo local + memoria (custo zero para desenvolvimento).
- Opcional: SQLite (nao obrigatorio para rodar).
- Escala maior: Postgres/Redis gerenciado (mais custo e operacao).

Detalhes: `docs/tradeoffs.md`, `docs/idea-and-code-explained.md`, `docs/publishing-and-getting-paid.md`.
