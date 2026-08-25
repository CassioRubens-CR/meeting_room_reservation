# Meeting Room Reservation - Frontend

Aplicação web para reserva de salas de reunião, construída com React, TypeScript, Vite, Tailwind CSS e Zustand. O frontend consome a API NestJS disponível no diretório `backend/`.

---

## 📋 Tabela de Conteúdos

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Iniciando a Aplicação](#iniciando-a-aplicação)
7. [Rotas](#rotas)
8. [Fluxos da Aplicação](#fluxos-da-aplicação)
9. [Estado e Persistência](#estado-e-persistência)
10. [Camada de API](#camada-de-api)
11. [Hooks e Componentes](#hooks-e-componentes)
12. [Responsividade e Design](#responsividade-e-design)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Testes e Validação](#testes-e-validação)
15. [Build e Deploy](#build-e-deploy)
16. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O frontend oferece:

- Cadastro e login de usuários.
- Persistência da sessão com JWT no `localStorage`.
- Dashboard autenticado.
- Listagem de salas.
- Criação, edição e cancelamento de reservas.
- Quantidade de participantes em reservas administrativas.
- Justificativa para reservas ADMIN com mais de um participante.
- Limite do campo de participantes pela capacidade total da sala.
- Validação de capacidade, conflitos e duplicidade feita pelo backend.
- CRUD administrativo de salas.
- Perfil com alteração de senha.
- Menu do usuário com avatar, perfil e logout.
- Menu sanduíche para telas mobile.
- Modais de confirmação para ações destrutivas.
- Estados de carregamento, vazio, erro e sucesso.

O backend permanece a fonte de verdade para autenticação, autorização, capacidade, conflitos de horário e persistência.

A aplicação está completa e publicada no **Render**:

*   **🖥️ Frontend Web (Aplicação publicada):** [Acessar a Aplicação](https://meeting-room-frontend-1hc3.onrender.com)
*   **⚙️ Backend/API:** [Endpoints da API](https://meeting-room-backend-zi7k.onrender.com)

##### Usuário de teste (Test User): 
```text
Admin | admin@example.com | admin123456
User | user@example.com  | user1234567
```

--- 
> ⚠️ **Nota de Avaliação (Cold Start):**
> O projeto está hospedado na camada gratuita do Render. Se o sistema estiver inativo, o primeiro carregamento ou requisição pode demorar **de 1 a 2 minutos** para o container acordar. Após esse aquecimento, o sistema opera com velocidade normal.
> 
> *   **Persistência:** O banco utiliza **SQLite com Prisma** rodando em disco temporário efêmero. O estado reseta para os dados padrão (*seed*) a cada reinicialização automática do servidor.

---

## 🛠️ Stack Tecnológico

### Aplicação

| Tecnologia | Versão | Uso |
|----------|--------|-----|
| React | `^19.2.8` | Componentes e interface |
| TypeScript | `~6.0.2` | Tipagem estática |
| Vite | `^8.2.0` | Desenvolvimento e build |
| React Router DOM | `^7.18.2` | Rotas e navegação |
| Zustand | `^5.0.15` | Estado global |

### Estilos e qualidade

| Tecnologia | Versão | Uso |
|----------|--------|-----|
| Tailwind CSS | `^3.4.17` | Estilos utilitários e responsividade |
| PostCSS | `^8.5.26` | Processamento CSS |
| Autoprefixer | `^10.5.4` | Compatibilidade CSS |
| ESLint | `^10.8.0` | Linting |
| TypeScript ESLint | `^8.65.0` | Regras TypeScript |

---

## 🏗️ Arquitetura

```text
frontend/
├── public/
├── src/
│   ├── api/                       # Cliente HTTP organizado por recurso
│   │   ├── auth/
│   │   ├── http/
│   │   ├── reservations/
│   │   └── rooms/
│   │
│   ├── components/                # Componentes compartilhados, cada um em sua pasta
│   │
│   ├── hooks/                     # Hooks reutilizáveis, cada um em sua pasta
│   │
│   ├── pages/                     # Telas e fluxos, cada um em sua pasta
│   ├── routes/                    # Metadados de rotas organizados por rota
│   ├── store/                     # Stores organizadas por domínio
│   ├── utils/                     # Funções puras reutilizáveis e testadas
│   │   ├── formatDate.ts
│   │   ├── formatTime.ts
│   │   ├── getDurationInMinutes.ts
│   │   ├── getReservationStatus.ts
│   │   ├── getToday.ts
│   │   └── index.ts
│   │
│   ├── types/                     # Contratos TypeScript
│   │   └── models.ts
│   ├── App.tsx                    # BrowserRouter e rotas
│   ├── index.css                  # Diretivas Tailwind e estilos globais
│   └── main.tsx                   # Bootstrap React
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

### Princípios usados

- Páginas concentram composição e interação da tela.
- Stores concentram estado assíncrono e chamadas da API.
- Módulos em `api/` concentram contratos HTTP.
- Componentes compartilhados ficam em `components/`.
- Comportamentos reutilizáveis ficam em `hooks/`.
- Funções puras de formatação devem permanecer próximas do domínio ou ser movidas para `utils/`, não para hooks.
- Funções puras reutilizáveis ficam em `utils/`, com testes unitários co-localizados.
- A definição das rotas fica em `routes/`, mantendo o `App.tsx` responsável apenas pela composição.

---

## 📦 Instalação

### Pré-requisitos

- Node.js `20+`.
- npm `10+`.
- Backend configurado e executando.

### Passos

```bash
cd frontend
npm install
```

O frontend não possui dependência direta do banco. A comunicação acontece exclusivamente com a API HTTP.

---

## ⚙️ Configuração

Por padrão, o cliente HTTP usa:

```text
http://localhost:3001
```

Para sobrescrever a URL, crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Depois de alterar variáveis `VITE_*`, reinicie o servidor Vite.

O backend deve permitir a origem do frontend em `FRONTEND_URL`, normalmente:

```env
FRONTEND_URL="http://localhost:5173"
```

Durante desenvolvimento, use o mesmo host nos dois lados. Por exemplo, prefira `localhost` tanto no frontend quanto na API.

---

## 🚀 Iniciando a Aplicação

### Desenvolvimento

```bash
cd frontend
npm run dev
```

URL padrão:

```text
http://localhost:5173
```

### Preview do build

```bash
npm run build
npm run preview
```

### Scripts disponíveis

```bash
npm run dev        # Servidor Vite
npm run build      # TypeScript + bundle de produção
npm run lint       # ESLint
npm run preview    # Servir o bundle localmente
npm run test       # Suíte de testes (Vitest)
npm run test:cov   # Suíte de testes com cobertura (mínimo de 80%)
```

---

## 🧭 Rotas

### Rotas públicas

| Rota | Tela |
|------|------|
| `/login` | Login |
| `/register` | Cadastro |

### Rotas protegidas

| Rota | Tela | Regra |
|------|------|-------|
| `/` | Dashboard | JWT |
| `/dashboard` | Dashboard | JWT |
| `/rooms` | Salas disponíveis | JWT |
| `/rooms/:roomId/reserve` | Nova reserva | JWT |
| `/reservations` | Minhas reservas | JWT |
| `/reservations/:reservationId/edit` | Editar reserva | JWT |
| `/profile` | Perfil e troca de senha | JWT |
| `/admin/rooms` | Administração de salas | JWT + ADMIN no backend |
| `/admin/reservations` | Todas as reservas e filtros | JWT + ADMIN no backend |

`ProtectedRoute` aguarda a hidratação do estado salvo antes de redirecionar usuários não autenticados para `/login`.

---

## 🔄 Fluxos da Aplicação

### Cadastro e login

1. Usuário preenche o formulário.
2. O frontend envia `POST /auth/register` ou `POST /auth/login`.
3. O backend retorna `accessToken` e `user`.
4. O store salva os dados no `localStorage` com a chave `meeting-room-auth`.
5. A página navega para `/dashboard`.

### Dashboard

- Carrega salas e reservas quando necessário.
- Exibe atalhos para salas e reservas.
- Exibe `Gerenciar Salas` apenas para ADMIN.
- O card `Seu Perfil` direciona para `/profile`.

### Reserva

1. Usuário acessa `/rooms`.
2. Escolhe uma sala.
3. Informa data e horário.
4. ADMIN pode informar participantes e justificativa.
5. A API valida janela, capacidade e conflitos.
6. Após sucesso, o frontend retorna para `/reservations`.

Usuários comuns não podem criar uma reserva sobreposta na mesma sala e horário. ADMIN pode consolidar uma nova solicitação no mesmo dia, sala e horário exato de uma reserva própria: os participantes são somados e uma nova justificativa é exigida. A capacidade total continua sendo validada pelo backend.

### Minhas reservas

- Lista as reservas do usuário.
- Exibe sala, localização, data, horário, participantes e justificativa.
- Permite editar reservas confirmadas.
- Permite cancelar reservas confirmadas.
- Reservas canceladas permanecem visíveis apenas como histórico, sem botões duplicados de ação.

### Administração de salas

ADMIN pode:

- Cadastrar sala.
- Editar nome, capacidade e localização.
- Excluir sala sem reservas vinculadas.
- Receber erro da API no modal quando a sala possui reservas.

### Perfil

- Nome e e-mail são exibidos somente para leitura.
- Usuário informa a senha atual.
- Usuário informa a nova senha duas vezes.
- O backend valida a senha atual e salva apenas o hash da nova senha.

---

## 🧠 Estado e Persistência

### `useAuthStore`

Estado:

```ts
{
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  hydrated: boolean
}
```

Métodos principais:

- `login(payload)`
- `register(payload)`
- `changePassword(currentPassword, newPassword)`
- `hydrate()`
- `logout()`
- `clearError()`

### `useRoomsStore`

- `fetchRooms(token)`
- `createRoom(payload, token)`
- `updateRoom(roomId, payload, token)`
- `deleteRoom(roomId, token)`

### `useReservationsStore`

- `fetchMyReservations(token)`
- `createReservation(payload, token)`
- `updateReservation(reservationId, payload, token)`
- `cancelReservation(reservationId, token)`

Cada store mantém `loading`, `error` e dados de domínio, além de atualizar a coleção local após mutações bem-sucedidas.

---

## 📡 Camada de API

O cliente em [api/http/http.ts](src/api/http/http.ts) centraliza:

- URL base configurável por `VITE_API_URL`.
- Serialização JSON.
- Header `Content-Type`.
- Header `Authorization: Bearer ...`.
- Conversão de respostas de erro em `ApiError`.
- Mensagens vindas de `message` string ou array do backend.

Módulos:

```text
api/auth/            -> /auth/register, /auth/login, /auth/change-password
api/rooms/           -> /rooms
api/reservations/    -> /reservations
```

Os tipos em `types/models.ts` refletem os contratos principais do backend:

- `Role`: `USER | ADMIN`
- `ReservationStatus`: `CONFIRMED | CANCELLED`
- `User`
- `Room`
- `Reservation`
- `AuthResponse`

---

## 🧩 Hooks e Componentes

### `useClickOutside`

Fecha um estado quando o usuário interage fora de uma ou mais referências DOM. É usado pelo menu mobile e pelo menu do usuário.

### `useEscapeKey`

Executa uma callback quando `Escape` é pressionado. É usado no menu e no `ConfirmModal`.

### `ProtectedRoute`

Impede renderização de telas protegidas sem autenticação persistida.

### `Layout`

Responsável por:

- Cabeçalho.
- Marca centralizada.
- Navegação desktop com `NavLink`.
- Menu sanduíche mobile.
- Avatar e menu do usuário.
- Logout.
- Área principal responsiva.

### `ConfirmModal`

Modal compartilhado para exclusão de salas e cancelamento de reservas. Recebe mensagem de erro da API e mantém o modal aberto quando a operação falha.

---

## 📱 Responsividade e Design

O frontend segue abordagem mobile-first com Tailwind CSS:

- Classes base atendem telas pequenas.
- Breakpoints `sm:` e `lg:` ampliam o layout.
- Campos e botões usam altura mínima próxima de 44px.
- Formulários usam `overflow-y-auto` e `100dvh` quando necessário.
- Fallbacks de viewport (`100vh`, `-webkit-fill-available` e `100dvh`) protegem telas de autenticação no Safari/iOS.
- As áreas seguras do iPhone são respeitadas com `safe-area-inset`.
- Grades mudam de uma coluna para duas ou três colunas conforme a largura.
- Menu desktop é ocultado em telas menores.
- Menu sanduíche é exibido apenas no mobile.
- Marca possui largura delimitada e truncamento em telas estreitas.

Paleta principal:

- Azul de marca: `#114881`.
- Ciano de destaque: `#00e6ff`.
- Classes Tailwind: `brand-*` e `accent-*`.

---

## ⚠️ Tratamento de Erros

O frontend exibe mensagens retornadas pela API, por exemplo:

```text
Não é possível excluir uma sala com reservas vinculadas
```

Comportamentos previstos:

- Erro de autenticação aparece no formulário.
- Erro de capacidade aparece no formulário de reserva.
- Erro de exclusão aparece dentro do modal.
- Erros de exclusão aparecem somente no modal aberto, não no formulário.
- Erro de cancelamento aparece dentro do modal.
- Erro anterior é limpo ao abrir ou fechar um modal.
- Loading desabilita controles durante requisições.

O frontend não substitui a autorização do backend. Esconder o card ADMIN é apenas uma melhoria de interface; a API continua responsável por retornar `403` quando necessário.

---

## 🧪 Testes e Validação

O frontend deixou de depender só de lint e build: hoje existe uma suíte automatizada com **Vitest**, **Testing Library** e **jsdom**, cobrindo desde a camada de API até páginas inteiras renderizadas com roteamento real.

```bash
npm run test        # roda a suíte uma vez
npm run test:watch  # modo watch, útil durante o desenvolvimento
npm run test:cov    # roda com relatório de cobertura
```

A configuração de cobertura fica em `vite.config.ts` (`test.coverage`) e exige, no mínimo, **80% de statements, branches, funções e linhas**. Se um PR reduzir a cobertura abaixo disso, `npm run test:cov` falha — assim como acontece no backend.

O que a suíte cobre hoje:

- **Camada de API** (`api/*/*.test.ts`): cada módulo de autenticação, salas e reservas é testado contra um `fetch` mockado, além dos casos de erro e resposta sem corpo em `http`.
- **Stores** (`store/*/*.test.ts` e `store/__tests__/stores.test.ts`): fluxo feliz e de erro de cada ação de `useAuthStore`, `useRoomsStore` e `useReservationsStore`, incluindo hidratação da sessão e mensagens de fallback.
- **Hooks** (`hooks/*/*.test.ts`): `useClickOutside` e `useEscapeKey` isolados em componentes de teste dedicados.
- **Componentes** (`components/*/*.test.tsx`): `ConfirmModal` (abertura, confirmação, loading, fechamento por clique fora e por `Escape`), `Layout` (navegação desktop/mobile, menu do usuário, logout) e `ProtectedRoute`.
- **Páginas** (`pages/*/*.test.tsx` e `pages/__tests__/*.tsx`): login, cadastro, salas, criação/edição de reserva, fluxo administrativo, perfil e página inicial, com estados de carregamento, vazio e erro.
- **Utilitários** (`utils/*.test.ts`): formatação de datas e horários, duração, status e data atual.
- **`App.tsx`**: redirecionamento para `/login` quando não autenticado, acesso ao dashboard quando autenticado e fallback de rotas desconhecidas.

Não é uma suíte E2E: os testes usam mocks da camada de API (`api/*/*.ts`) e do `fetch`, então a fonte de verdade sobre regras de negócio (capacidade, conflitos, autorização) continua sendo o backend e seus próprios testes.

### Checklist manual complementar

Além da suíte automatizada, vale conferir manualmente antes de um deploy:

- Login USER redireciona para `/dashboard`.
- Login ADMIN redireciona para `/dashboard`.
- Cadastro redireciona para `/dashboard`.
- Reload mantém a sessão.
- USER não vê o atalho administrativo.
- ADMIN acessa `/admin/rooms`.
- Menu mobile abre, fecha por clique fora e fecha com `Escape`.
- Avatar abre perfil e logout.
- Exclusão de sala exige confirmação.
- Sala com reservas exibe o erro da API no modal.
- Cancelamento de reserva exige confirmação.
- Reserva cancelada não exibe ações duplicadas.
- Horários são exibidos no fuso local do navegador.
- Perfil altera senha somente com senha atual correta.
- Ao excluir uma sala que estava em edição, o formulário é resetado.

---

## 📦 Build e Deploy

Gerar bundle:

```bash
npm run build
```

O resultado é criado em `frontend/dist/`.

Para servir localmente:

```bash
npm run preview
```

Em produção, configure `VITE_API_URL` antes do build, pois variáveis `VITE_*` são incorporadas ao bundle durante a compilação:

```env
VITE_API_URL=https://meeting-room-backend-zi7k.onrender.com
```

O servidor de produção também precisa permitir a origem do frontend no CORS.

---

## 🔧 Troubleshooting

### `Failed to fetch`

Verifique:

1. Backend em execução.
2. Porta configurada no backend.
3. `VITE_API_URL` apontando para a mesma porta.
4. `FRONTEND_URL` configurado no backend.
5. Uso consistente de `localhost` ou `127.0.0.1`.

### `429 Too Many Requests` ao carregar salas

O throttling deve ser aplicado ao login, não globalmente às rotas de salas e reservas. Reinicie o backend após alterações de configuração.

### Sessão desaparece após reload

Verifique no console:

```js
localStorage.getItem('meeting-room-auth')
```

Se estiver usando outro host, como `127.0.0.1` em vez de `localhost`, o navegador pode estar usando outro armazenamento de origem.

### Erro `EBUSY` ou `EPERM` no Vite

Dropbox, antivírus ou outro processo pode bloquear `frontend/node_modules/.vite` ou `frontend/dist`. Pare processos Node duplicados e tente novamente.

### Erro de porta ocupada

```bash
netstat -ano | grep ':3001'
taskkill //PID <PID> //F
```

Encerre apenas o processo correto antes de iniciar outra instância.

---

## 🔗 Backend

A documentação técnica da API está em [backend/README.md](../backend/README.md).

O README geral do projeto está em [../README.md](../README.md).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---