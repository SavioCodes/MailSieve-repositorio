# Tradeoffs

## FATOS (da fonte validada)

- Preferência de integração paga: `0`.
- Projeto deve funcionar localmente com custo zero.
- Lista local CC0 é obrigatória para modo offline.

## JSON/arquivo vs SQLite vs Postgres/Redis gerenciado

- **Arquivo JSON/TXT (padrão)**
  - Prós: simples, custo zero local, sem setup extra.
  - Contras: concorrência limitada, escala menor, risco de corrupção sem cuidado.
- **SQLite (opcional, SUPOSIÇÃO)**
  - Prós: transações locais, melhor consistência que arquivo puro.
  - Contras: adiciona complexidade operacional e estratégia de lock.
- **Postgres/Redis gerenciado (SUPOSIÇÃO)**
  - Prós: escala horizontal, compartilhamento entre múltiplas instâncias.
  - Contras: custo recorrente, rede, operação e observabilidade mais complexas.

## In-memory vs persistente (rate-limit/usage)

- **In-memory (padrão)**
  - Prós: rápido e simples.
  - Contras: perde estado ao reiniciar.
- **Persistente em arquivo (opcional)**
  - Prós: mantém estado após restart.
  - Contras: I/O e complexidade de manutenção.

## Free tier vs pago

- **Free/local**: ideal para MVP e validação inicial.
- **Pago**: necessário quando exigir alta disponibilidade, múltiplas réplicas e throughput maior.
- Custos variam por provedor; validar sempre em pricing oficial antes de contratar.

## Simplicidade vs escalabilidade

- O projeto atual prioriza simplicidade e previsibilidade de custo.
- Evolução para escala pode exigir banco gerenciado, fila e cache externo.

## Provedor/modelo opcional

- Decisão adotada: o core continua funcional sem provedor; se o provedor opcional estiver configurado e indisponível, a API retorna `provider_unavailable` no Error Model (sem crash do processo).
- Trade-off: comportamento explícito de erro para integrações dependentes do provedor, mantendo previsibilidade operacional.

## COMO VALIDAR (passos práticos)

1. Rodar local com defaults (`memory` + arquivo local).
2. Habilitar modo `file` para rate-limit/usage e verificar persistência após restart.
3. Configurar provedor inválido e confirmar retorno `provider_unavailable` sem derrubar o servidor.
