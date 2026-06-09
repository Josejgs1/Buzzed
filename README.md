# 🍸 Buzzed

**Buzzed** é uma plataforma inovadora e gamificada para descoberta e avaliação de coquetéis. O aplicativo funciona como um curador pessoal de drinks e uma ponte de feedback detalhado entre consumidores e estabelecimentos (bares e restaurantes).

O grande diferencial do Buzzed é a sua abordagem focada no **perfil sensorial** (doçura, amargor, força e toque cítrico) em vez de ingredientes complexos, ajudando pessoas que não entendem profundamente de mixologia a encontrar a bebida perfeita. Além disso, o aplicativo conta com um sistema de **gamificação** (conquistas/badges) para incentivar a exploração contínua de novos drinks e o engajamento com as avaliações.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com **Express** para a criação da API REST.
- **Prisma ORM** para modelagem, migrações e manipulação do banco de dados.
- **SQLite** como banco de dados local para facilitar o setup inicial do MVP.
- **JWT (JSON Web Tokens)** e **Bcrypt** para autenticação e segurança dos usuários.

### Frontend (Mobile)
- **React Native** com o framework **Expo** (SDK 54).
- **React Navigation** para a estrutura de roteamento e navegação (Stack e Bottom Tabs).
- **Axios** para o consumo da API.
- **AsyncStorage** para persistência local do token de sessão.

---

## 📱 Como Rodar o Projeto

Para executar o MVP, você precisará do **Node.js (versão 20 ou superior)** instalado na sua máquina.

### 1. Subindo o Backend (API)

Abra um terminal, acesse a pasta raiz do projeto e execute:

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências do Node
npm install

# Crie o banco de dados e popule-o com dados de teste (bares, drinks e usuários)
npx prisma migrate dev
npm run seed

# Inicie a API
npm run dev
```
> O servidor do backend passará a rodar na porta `3333`. Mantenha este terminal aberto.

### 2. Rodando o App com o Expo Go

> **⚠️ IMPORTANTE:** Para testar o app em um dispositivo físico, seu celular e seu computador **precisam estar conectados na mesma rede Wi-Fi**.

1. Instale o aplicativo **Expo Go** no seu celular (Google Play Store ou Apple App Store).
2. Abra um **novo terminal** no computador e execute:

```bash
# Entre na pasta do frontend
cd frontend

# Se você utiliza o NVM, certifique-se de estar na versão 20 do Node
nvm use 20

# Instale as dependências
npm install

# Inicie o servidor do Expo
npx expo start -c
```

3. Um **QR Code** será gerado no terminal.
4. Abra o **Expo Go** no seu celular:
   - **Android:** Toque em "Scan QR Code" na tela inicial do app e aponte para o terminal.
   - **iOS:** Abra a Câmera nativa do iPhone, escaneie o QR Code e toque para abrir no Expo Go.

## 🌐 Deploy Atual

Este projeto está separado em dois serviços:

- **Frontend (Vercel):** `https://buzzed-sage.vercel.app`
- **Backend (Render):** `https://buzzed-5umx.onrender.com`

### Vercel

No projeto do frontend na Vercel, configure:

```env
EXPO_PUBLIC_API_URL=https://buzzed-5umx.onrender.com
```

Use estes comandos:

```text
Root Directory: frontend
Build Command: npx expo export --platform web --output-dir dist
Output Directory: dist
```

### Render

No serviço do backend no Render, configure:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=uma-chave-segura
NODE_VERSION=20
```

Use estes comandos:

```text
Root Directory: backend
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: node src/server.js
```

Depois do primeiro deploy com banco vazio, rode `npm run seed` uma vez no Shell do Render para criar os usuários de teste.

### 🔑 Usuários para Teste

Ao rodar o `npm run seed`, o banco já é populado com três contas prontas para uso. Você pode fazer login no app usando:

- **Login:** `maria@buzzed.com` | **Senha:** `123456`
- **Login:** `joao@buzzed.com` | **Senha:** `123456`
- **Login:** `ana@buzzed.com` | **Senha:** `123456`
