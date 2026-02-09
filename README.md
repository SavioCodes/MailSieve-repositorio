# MailSieve

## Visao Geral
MailSieve e uma API HTTP para classificacao de email de cadastro, deteccao de dominio descartavel e risco lite com sinais explicaveis.

## Status do Projeto
| Item | Valor |
|:--|:--|
| Maturidade | Em evolucao ativa |
| Tipo | API backend |
| Ultima atualizacao relevante | 2026-02 |

## Stack
| Camada | Tecnologias |
|:--|:--|
| Runtime | Node.js 20+ |
| API | Express |
| Validacao | Zod |
| Seguranca basica | Helmet, CORS |
| Observabilidade | Pino |
| Testes | Jest, Supertest |

## Estrutura
- `src/`: codigo principal da API.
- `tests/`: testes automatizados.
- `docs/`: documentacao tecnica e historico.
- `openapi.yaml`: contrato OpenAPI.
- `scripts/`: utilitarios (keys, verify, update lists).

## Como Executar
```bash
npm install
cp .env.example .env
npm run build
npm start
```

## Endpoints Principais
- `GET /v1/health`
- `POST /v1/generate`
- `POST /v1/batch`

## Testes
```bash
npm test
npm run verify
```

## CI
Workflow padronizado em `.github/workflows/ci.yml`.

## Deploy
Sem URL publica fixa no README.
Use apenas endpoint estavel e validado no momento do deploy.

## Roadmap
- ampliar base de dominios descartaveis
- reforcar observabilidade e metricas de uso
- melhorar testes de carga e resiliencia

## Licenca
MIT (`LICENSE`).