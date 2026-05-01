# Frontend do PulseNotify

Interface em React + Vite para simular o envio e recebimento de notificacoes em tempo real.

## O que esta interface faz

- Seleciona usuarios simulados.
- Envia notificacoes para o backend Spring Boot.
- Recebe eventos via WebSocket.
- Exibe notificacoes recentes.
- Mostra o status da conexao com API e WebSocket.

## Tecnologias

- React
- Vite
- Lucide React
- CSS

## Como rodar

```bash
npm install
npm run dev
```

## Variaveis de ambiente

Crie um arquivo `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/notifications
```

## Scripts

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de producao
npm run preview  # preview do build
npm run lint     # analise estatica
```
