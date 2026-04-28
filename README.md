# Notificacoes em tempo real - ambiente local

Esta pasta guarda a configuracao minima para rodar o Redis localmente com Docker.

## O que e pago?

Nada aqui precisa de plano pago do Docker.

Voce nao precisa criar repositorio no Docker Hub, usar Build Cloud, Kubernetes,
Docker AI, Hardened Images, Admin Console ou teste gratis.

O Docker Desktop local e suficiente para estudar e rodar containers no seu PC.

## Para ligar o Redis

Abra o PowerShell nesta pasta e rode:

```powershell
docker compose up -d
```

Na primeira vez, o Docker baixa a imagem `redis:7-alpine` automaticamente.

## Para ver se esta rodando

```powershell
docker ps
```

Voce deve ver um container chamado `redis-notificacoes`.

## Para desligar

```powershell
docker compose down
```

## Endereco que o Spring Boot usara

```text
localhost:6379
```

## Observacao

No Windows, o Docker Desktop precisa do WSL/Linux engine funcionando para rodar
imagens Linux como Redis. Se aparecer erro 500 no `docker info`, abra o Docker
Desktop e confira se o engine terminou de iniciar.

## Se o Docker disser "Virtualization support not detected"

Isso nao e problema de conta, plano pago ou Docker Hub.

O Docker Desktop esta detectando que a virtualizacao necessaria para containers
Linux ainda nao esta disponivel para ele.

Checklist:

1. No Gerenciador de Tarefas:
   - Abra `Ctrl + Shift + Esc`
   - Va em `Desempenho > CPU`
   - Confira se aparece `Virtualizacao: Habilitado`

2. No BIOS/UEFI:
   - Em processadores AMD, habilite `SVM Mode` ou `AMD-V`
   - Em processadores Intel, habilite `Intel VT-x` ou `Virtualization Technology`
   - Salve e reinicie

3. Em "Ativar ou desativar recursos do Windows", confira se estao ligados:
   - `Subsistema do Windows para Linux`
   - `Plataforma de Maquina Virtual`
   - `Plataforma do Hipervisor do Windows`
   - `Hyper-V`, se sua edicao do Windows tiver suporte

4. Depois reinicie o Windows.

5. Abra o Docker Desktop e tente novamente:

```powershell
docker info
docker compose up -d
```

Neste computador, o diagnostico atual mostrou:

```text
Docker Desktop: hasNoVirtualization: true
CPU: AMD Ryzen 3 3200G
VirtualizationFirmwareEnabled: True
SecondLevelAddressTranslationExtensions: False
VMMonitorModeExtensions: False
```

Enquanto `SecondLevelAddressTranslationExtensions` ou `VMMonitorModeExtensions`
aparecerem como `False`, o Docker Desktop pode continuar recusando iniciar.
