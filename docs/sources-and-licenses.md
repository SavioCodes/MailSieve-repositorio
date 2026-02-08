# Sources and Licenses

## FATOS (da IDEIA VALIDADA)

- A lista de disposable deve ser CC0.
- Exemplo de referência: `di/martenson-disposable-email-domains`.

## SUPOSIÇÕES (formato local adotado)

- `data/disposable_domains.txt` contém uma amostra inicial para rodar offline.
- `data/disposable_domains.version` registra metadados em linhas `chave=valor`.
- Script opcional de atualização: `scripts/update_disposable_list.js`.

## Fonte sugerida para atualização

- Repositório: `https://github.com/disposable-email-domains/disposable-email-domains` (ou outra fonte CC0 validada).
- Exemplo citado na IDEIA VALIDADA: `https://github.com/di/martenson-disposable-email-domains`.

## Passos para atualizar com validação de licença

1. Confirmar licença CC0 no upstream (`LICENSE`, `README`, release notes).
2. Definir `DISPOSABLE_LIST_SOURCE_URL` para o arquivo bruto da lista.
3. Rodar `npm run update:disposable-list`.
4. Verificar se `data/disposable_domains.version` foi atualizado.
5. Rodar testes (`npm test`) para garantir compatibilidade.

## COMO VALIDAR (passos práticos)

- Abrir `data/disposable_domains.version` e conferir `source`, `license`, `version`, `updated_at`.
- Auditar licença da fonte antes de publicar na RapidAPI.
