# 🎧 Vadrox — Player de Música Premium

> **⚠️ Aviso:** Este repositório contém **apenas o código do front-end** do Vadrox. O backend (API de streaming, integração com IA e extração de áudio) é um **serviço privado** mantido em ambiente controlado e **não está incluído neste repositório** por questões de segurança e arquitetura. Este projeto é de **uso pessoal e educacional**, sem fins comerciais.

---

## 📖 Visão Geral

O Vadrox é um player de música mobile completo, construído do zero com React Native e um backend customizado em Node.js. O projeto foi um desafio de engenharia completo, envolvendo o desenvolvimento do app mobile, a criação de uma API robusta e a integração de múltiplos modelos de IA.

**Este repositório é uma vitrine técnica do front-end**, demonstrando habilidades em React Native, TypeScript, gerenciamento de estado, player de áudio nativo e UI/UX complexa.

## ✨ Principais Funcionalidades

- **🎵 Player de Áudio Avançado:** Reprodução em background com play/pause, next/prev, shuffle, repeat e controle de velocidade.
- **🧠 Recomendações com IA:** Sistema que usa LLMs para inferir artistas similares, com "Slider de Aventura" que controla o nível de descoberta musical.
- **💬 Assistente Pessoal (Sérgio):** Chatbot com personalidade que busca músicas e interage com o usuário, com fallback entre múltiplos provedores de IA.
- **📥 Downloads Offline:** Capacidade de baixar faixas para ouvir sem internet.
- **🎨 Temas Dinâmicos:** 12 temas visuais que alteram cores, gradientes e formato dos balões de chat.
- **📚 Gerenciamento Completo:** Playlists, favoritos e histórico de reprodução detalhado.

## 🏗️ Arquitetura (Conceitual)

A arquitetura do Vadrox separa o app mobile (público, neste repo) do backend (privado, serviço à parte).
┌─────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐
│ App Mobile │ │ Backend (Render) │ │ Backend (PC Local) │
│ (React Native) │ │ (Fastify API) │ │ (Fastify API) │
├─────────────────┤ ├──────────────────────┤ ├─────────────────────┤
│ - UI/UX │─────▶│ - /search │ │ - /stream/:id │
│ - Zustand │ │ - /chat/ask │ │ - yt-dlp (Resolve) │
│ - Track Player │ │ - /recommendations │ │ - Cloudflare Tunnel │
└─────────────────┘ └──────────────────────┘ └─────────────────────┘

text

**Nota:** O backend é um serviço privado. O código do servidor, a lógica de extração de áudio e as chaves de API **não estão neste repositório**.

## 🛠️ Stack Tecnológico (Front-end)

| Camada | Tecnologia |
| :--- | :--- |
| **Mobile** | React Native (CLI), TypeScript |
| **Navegação** | React Navigation 7 (Stack + Drawer + Tabs) |
| **Estado** | Zustand + persist (AsyncStorage) |
| **Player de Áudio** | `@rntp/player` (V5, Nitro/JSI) |
| **Download** | `react-native-blob-util` |
| **UI** | Componentes customizados, 12 temas dinâmicos |

## 🚀 Como Rodar (Apenas Front-end)

> **Pré-requisito:** O app precisa de um backend rodando para funcionalidades de busca, chat e streaming. Como o backend é privado, **o app não funcionará 100% apenas com este repositório**. Esta seção é para fins de demonstração técnica.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Thiago-Full/vadrox.git
    cd vadrox
Instale as dependências:

bash
npm install
Inicie o Metro:

bash
npx react-native start
Rode no Android (outro terminal):

bash
npx react-native run-android
🗺️ Roadmap
☑ V1.0 — Player, busca, chatbot, playlists
☑ V1.1 — Multi-conversas, upload de foto da IA
☑ V1.2 — 12 temas, recomendações IA, painel dev
☑ V1.3 — Histórico, compartilhar, velocidade, slider aventureiro
□ V1.4 — Melhorias no sistema de recomendação
📄 Licença e Uso
Este projeto é de uso pessoal e educacional. O código do front-end é disponibilizado para fins de portfólio e demonstração técnica. O backend é um serviço privado e não está incluído.

A ferramenta yt-dlp (usada no backend privado) é de código aberto e domínio público. Este projeto não tem fins comerciais e não distribui conteúdo protegido por direitos autorais.

Thiago (CEO & Full-Stack Developer)
GitHub
