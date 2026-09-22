# 🚀 IUS EMAIL CONTROL — Enterprise Gmail Operating Platform

> **Camada inteligente de controle operacional sobre o Gmail empresarial com motor de diretrizes IUS Natura.**  
> *Não é um novo provedor de e-mail — o Gmail continua sendo a fonte oficial da verdade.*

---

## 🏗️ Arquitetura Canônica

```
Google Cloud OAuth 2.0 (Navegador Oficial do Sistema / Chromium)
       ↓
Gmail API v1 (Mensagens, Threads, Histórico, Ações)
       ↓
Sync Engine (Progresso em 7 etapas, Sincronização incremental & cache)
       ↓
Motor de Conformidade & Inteligência IUS Natura (11 escopos oficiais de leitura)
       ↓
Índice & Cache Local (%APPDATA%/ius_email_control/data)
       ↓
EMAIL CONTROL UI (Layout 3-Pane, Splitter Ajustável, Temas White/Dark)
       ↓
Operações Sincronizadas no Gmail (Arquivar, Excluir, Lida/Não Lida, Estrela, Resposta Rápida)
```

---

## 🖥️ Telas do Sistema

1. **TELA 01 — CONEXÃO GMAIL** (`src/components/GoogleConnect.tsx`):
   - Identidade IUS EMAIL CONTROL com suporte completo a **Dark Mode** e **White Mode**.
   - Mockup do aplicativo com ícones vetoriais oficiais Lucide.
   - Autenticação corporativa via **Google OAuth 2.0** com abertura automática no navegador do sistema operacional.
   - Modo de demonstração corporativo para homologação imediata.

2. **TELA 02 — SINCRONIZAÇÃO INTELIGENTE** (`src/components/SyncProgress.tsx`):
   - Medidor circular SVG de progresso operacional e checklist com as 7 etapas oficiais de leitura.
   - Métricas em tempo real: E-mails encontrados, Conversas, Remetentes, Mensagens analisadas.
   - Classificação nas 4 categorias operacionais: **Clientes**, **Financeiro**, **Fornecedores**, **Legislação**.

3. **TELA 03 — CENTRAL DE E-MAIL EXECUTIVA** (`src/App.tsx`, `Sidebar.tsx`, `InboxList.tsx`, `EmailReader.tsx`, `AIInsightPanel.tsx`):
   - **Sidebar**: Navegação rápida com badges e contadores operacionais.
   - **InboxList**: Lista compacta de alta densidade com faixa de severidade (P1 a P4), badges de ação e data formatada.
   - **Divisória Ajustável (ResizablePane)**: Splitter horizontal arrastável entre 25% e 60% com persistência local.
   - **Leitor com Duplo Modo**: Alternância entre *Modo Formatado* e *Modo Leitura Higienizado*.
   - **Painel de Diretrizes IUS**: Análise de conformidade legal e operacional baseada nas orientações oficiais da IUS Natura.

---

## 📦 Executáveis Windows (.exe)

O projeto inclui empacotamento completo para desktop Windows via Electron:

- **Instalador Oficial**: `dist-electron/IUS-Email-Control-Setup-1.0.0.exe`
- **Versão Portátil**: `dist-electron/IUS-Email-Control-Portable-1.0.0.exe`
- **Pacotes Zip**: `dist-electron/IUS-Email-Control-Portable-1.0.0.zip`

### Gerar os executáveis localmente:
```bash
npm run package:win
```

---

## 🌐 Deploy em Produção (Web / Nuvem)

A plataforma pode ser executada como um serviço web unificado:

### Opção 1: Docker
```bash
# Construir e rodar container
docker-compose up -d --build
```
Acesse: `http://localhost:1000`

### Opção 2: Deploy Direto (Node.js / Render / Railway / VPS)
```bash
# 1. Instalar dependências
npm ci

# 2. Compilar frontend e backend
npm run build:all

# 3. Iniciar servidor de produção
npm start
```

---

## 🔄 CI/CD & Automação GitHub

- **CI (`.github/workflows/ci.yml`)**: Executa typecheck (`tsc`), testes unitários (`vitest`) e compilação em cada push para a branch `main`.
- **Release Automatizado (`.github/workflows/release-exe.yml`)**: Ao criar uma tag (ex: `v1.0.0`), o GitHub Actions compila os `.exe` no Windows e publica automaticamente no GitHub Releases.

---

## 🧪 Testes Automatizados

```bash
# Rodar todos os testes
npm test

# Verificação estrita de TypeScript
npm run typecheck
```

---

## 📄 Licença

Distribuído sob licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter detalhes.
