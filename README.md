# Vadrox

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
| :--- | :--- |
| **Mobile** | React Native, TypeScript, React Navigation, Zustand |
| **Player de Áudio** | `@rntp/player` (Nitro/JSI) |
| **Backend** | Node.js, Fastify, TypeScript |
| **Extração de Áudio** | `yt-dlp`, Python, `bgutil-ytdlp-pot-provider` |
| **Inteligência Artificial** | Google Gemini, OpenRouter, Groq |
| **Hospedagem & Túnel** | Render (Free Tier), Cloudflare Quick Tunnel |
| **Persistência Local** | AsyncStorage, React Native Blob Util |

## 🚀 Como Rodar (Ambiente de Desenvolvimento)

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Thiago-Full/vadrox.git
    ```
2.  **Instale as dependências do app mobile:**
    ```bash
    cd vadrox && npm install
    ```
3.  **Instale as dependências do backend:**
    ```bash
    cd vadrox-backend && npm install
    ```
4.  **Configure as variáveis de ambiente** (`.env`) no backend com suas chaves de API (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`).
5.  **Inicie o backend local:**
    ```bash
    npx tsx server.ts
    ```
6.  **Inicie o app mobile (em outro terminal):**
    ```bash
    npx react-native run-android
    ```

> **Nota:** Para o streaming de áudio funcionar em desenvolvimento, o backend local precisa estar rodando e o túnel Cloudflare ativo.

## 🗺️ Roadmap & Próximos Passos

O Vadrox está em constante evolução. As próximas etapas incluem:

- [ ] **V1.3:** Refinamento do tema Neon para consistência cross-platform.
- [ ] **V1.4:** Melhorias no sistema de recomendação com feedback do usuário (like/dislike).
- [ ] **Futuro:** Exploração de um modelo de assinatura para cobrir custos de API e hospedagem, mantendo uma versão gratuita com funcionalidades limitadas.

## 📄 Licença

Este projeto é de uso pessoal e educacional. O código não é destinado à distribuição comercial. A ferramenta `yt-dlp` utilizada no backend é de domínio público.

---
**Thiago (CEO & Full-Stack Developer)** - [LinkedIn](https://linkedin.com/in/seu-perfil) | [GitHub](https://github.com/Thiago-Full)
