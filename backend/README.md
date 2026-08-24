# Meeting Room Reservation - Backend API

Sistema de reserva de salas de reunião construído com **NestJS**, **Prisma** e **JWT Authentication**. Backend pronto para produção com segurança, validação e testes unitários.


---

## 📋 Tabela de Conteúdos

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Iniciando a Aplicação](#iniciando-a-aplicação)
7. [API Endpoints](#api-endpoints)
8. [Fluxo da Aplicação](#fluxo-da-aplicação)
9. [Segurança](#segurança)
10. [Testes](#testes)
11. [Banco de Dados](#banco-de-dados)

---

## 🎯 Visão Geral

Este é o backend de um sistema de reserva de salas de reunião que permite:

- ✅ **Autenticação JWT** com roles (USER / ADMIN)
- ✅ **Gerenciamento de Salas** (listar, criar com permissão de admin)
- ✅ **Reservas de Salas** (criar, listar, atualizar, cancelar)
- ✅ **Detecção de Conflitos** (não permite sobreposição de horários)
- ✅ **Controle de Acesso** baseado em papéis (RBAC)
- ✅ **Rate Limiting** no login (5 tentativas/minuto)
- ✅ **Validação Global** de payloads (DTOs)
- ✅ **Tratamento Centralizado** de exceções
- ✅ **Headers de Segurança** (Helmet, CORS, HSTS)
- ✅ **Testes Unitários** com Jest (78 testes, 16 suites, cobertura mínima de 80%)

---

## 🛠️ Stack Tecnológico

### Framework & Runtime
- **NestJS** `^11.0.1` - Framework backend progressivo
- **Node.js** `v24.13.1` - Runtime JavaScript

### Banco de Dados & ORM
- **Prisma** `6.12.0` - ORM type-safe com migrations automáticas
- **SQLite** `file:./dev.db` - Banco de dados local (dev)

### Autenticação & Segurança
- **@nestjs/jwt** `^11.0.2` - Geração e validação de JWT
- **@nestjs/passport** `^11.0.5` - Integração com estratégias de autenticação
- **passport-jwt** `^4.0.1` - Strategy JWT para Passport
- **bcrypt** `^6.0.0` - Hash seguro de senhas
- **helmet** `^8.3.0` - Headers de segurança HTTP
- **@nestjs/throttler** `^6.5.0` - Rate limiting

### Validação & Transformação
- **class-validator** `^0.15.1` - Validação declarativa de DTOs
- **class-transformer** `^0.5.1` - Transformação de objetos
- **@nestjs/config** `^4.0.4` - Gerenciamento de variáveis de ambiente

### Utilitários
- **dotenv** `^16.6.1` - Carregamento de .env
- **reflect-metadata** `^0.2.2` - Polyfill de metadados
- **rxjs** `^7.8.1` - Programação reativa

### Desenvolvimento & Testes
- **TypeScript** `^5.7.3` - Tipagem estática
- **Jest** `^30.0.0` - Framework de testes
- **ts-jest** `^29.2.5` - Transpilador TypeScript para Jest
- **@nestjs/testing** `^11.0.1` - Utilitários de teste do NestJS
- **supertest** `^7.0.0` - Testes HTTP
- **ESLint** `^9.18.0` - Linting de código
- **Prettier** `^3.4.2` - Formatação de código

---

## 🏗️ Arquitetura

```
backend/
├── src/
│   ├── app.module.ts                    # Módulo raiz
│   ├── main.ts                          # Bootstrap da aplicação
│   │
│   ├── auth/                            # Módulo de autenticação
│   │   ├── auth.service.ts              # Lógica: register, login
│   │   ├── auth.controller.ts           # Endpoints: POST /auth/register, /auth/login
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts         # Testes unitários
│   │   ├── auth.controller.spec.ts      # Testes unitários
│   │   ├── dto/
│   │   │   ├── register.dto.ts          # DTO: name, email, password
│   │   │   └── login.dto.ts             # DTO: email, password
│   │   └── strategies/
│   │       ├── jwt.strategy.ts          # Estratégia JWT (Passport)
│   │       └── jwt.strategy.spec.ts     # Testes unitários
│   │
│   ├── users/                           # Módulo de usuários
│   │   ├── users.service.ts             # Lógica: create, findByEmail, findById
│   │   ├── users.controller.ts          # (sem endpoints públicos)
│   │   ├── users.module.ts
│   │   ├── users.service.spec.ts        # Testes unitários
│   │   └── dto/
│   │       └── create-user.dto.ts       # DTO interna
│   │
│   ├── rooms/                           # Módulo de salas
│   │   ├── rooms.service.ts             # Lógica: findAll, create
│   │   ├── rooms.controller.ts          # Endpoints: GET /rooms, POST /rooms (ADMIN)
│   │   ├── rooms.module.ts
│   │   ├── rooms.service.spec.ts        # Testes unitários
│   │   ├── rooms.controller.spec.ts     # Testes unitários
│   │   └── dto/
│   │       └── create-room.dto.ts       # DTO: name, capacity, location
│   │
│   ├── reservations/                    # Módulo de reservas
│   │   ├── reservations.service.ts      # Lógica: create, update, cancel, getManageableReservation
│   │   ├── reservations.controller.ts   # Endpoints: GET /me, POST, PATCH/:id, DELETE/:id
│   │   ├── reservations.module.ts
│   │   ├── reservations.service.spec.ts # Testes unitários
│   │   ├── reservations.controller.spec.ts # Testes unitários
│   │   ├── reservations.repository.ts   # Queries de BD
│   │   ├── reservations.repository.spec.ts # Testes unitários
│   │   └── dto/
│   │       ├── create-reservation.dto.ts # DTO: roomId, date, startTime, endTime
│   │       └── update-reservation.dto.ts # DTO parcial para atualização
│   │
│   ├── common/                          # Código compartilhado
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts      # @Public() para rotas públicas
│   │   │   ├── roles.decorator.ts       # @Roles(Role.ADMIN) para RBAC
│   │   │   ├── current-user.decorator.ts # @CurrentUser() para injetar usuário
│   │   │   └── decorators.spec.ts       # Testes unitários (Public, Roles, CurrentUser)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts        # Valida JWT (respeita @Public)
│   │   │   ├── jwt-auth.guard.spec.ts   # Testes unitários
│   │   │   ├── roles.guard.ts           # Valida papéis (RBAC)
│   │   │   └── roles.guard.spec.ts      # Testes unitários
│   │   └── filters/
│   │       ├── http-exception.filter.ts # Formatação de erros HTTP
│   │       └── http-exception.filter.spec.ts # Testes unitários
│   │
│   └── prisma/                          # Módulo Prisma
│       ├── prisma.service.ts            # Singleton do cliente Prisma
│       ├── prisma.service.spec.ts       # Testes unitários
│       └── prisma.module.ts
│
├── prisma/
│   ├── schema.prisma                    # Schema do banco de dados
│   └── seed.ts                          # Script de seed para testes
│
├── test/                                # Testes e2e (estrutura)
│   └── jest-e2e.json                    # Config Jest para e2e
│
├── .env                                 # Variáveis de ambiente (não commitar)
├── .env.example                         # Template de .env
├── package.json                         # Dependências e scripts
├── tsconfig.json                        # Configuração TypeScript
├── jest.config.js                       # Configuração Jest
└── README.md                            # Este arquivo
```

---

## 📦 Instalação

### Pré-requisitos
- Node.js `v20+` (testado com v24.13.1)
- npm `v10+`
- Git

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/meeting_room_reservation.git
   cd meeting_room_reservation/backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados:**
   ```bash
   npx prisma db push
   ```

4. **Popule dados de teste (opcional):**
   ```bash
   npx ts-node prisma/seed.ts
   ```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `backend/`:

```bash
# Banco de Dados
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui"
JWT_EXPIRES_IN="1d"

# Servidor
PORT=3001
NODE_ENV="development"

# Frontend (CORS)
FRONTEND_URL="http://localhost:5173"
```

### Descrição das Variáveis

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão com Prisma | `file:./dev.db` |
| `JWT_SECRET` | Chave secreta para assinar JWTs | Obrigatório |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `1d` (1 dia) |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente (development/production) | `development` |
| `FRONTEND_URL` | URL do frontend para CORS | `http://localhost:5173` |

---

## 🚀 Iniciando a Aplicação

### Desenvolvimento (com hot-reload)

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3001`

### Produção

Primeiro, compile:
```bash
npm run build
```

Depois, execute:
```bash
npm run start:prod
```

### Outros Comandos

```bash
# Formatar código
npm run format

# Linter
npm run lint

# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes e2e (se configurados)
npm run test:e2e
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001
```

### 1. Autenticação

#### Registrar Novo Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senhaSegura123"
}
```

**Resposta (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER"
  }
}
```

**Erros:**
- `400 Bad Request` - Email duplicado ou password < 8 caracteres
- `422 Unprocessable Entity` - DTO inválida

---

#### Fazer Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senhaSegura123"
}
```

**Resposta (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER"
  }
}
```

**Erros:**
- `401 Unauthorized` - Email ou senha inválidos
- `429 Too Many Requests` - Rate limit (5 tentativas/minuto)

---

### 2. Salas de Reunião

#### Listar Salas
```http
GET /rooms
Authorization: Bearer {accessToken}
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Meeting Room A",
    "capacity": 10,
    "location": "1º Andar",
    "createdAt": "2026-08-21T16:38:32.711Z"
  },
  {
    "id": "uuid",
    "name": "Meeting Room B",
    "capacity": 20,
    "location": "2º Andar",
    "createdAt": "2026-08-21T16:38:32.733Z"
  }
]
```

**Erros:**
- `401 Unauthorized` - Token ausente ou inválido

---

#### Criar Nova Sala (Admin Only)
```http
POST /rooms
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "name": "Meeting Room C",
  "capacity": 15,
  "location": "3rd Floor"
}
```

**Resposta (201 Created):**
```json
{
  "id": "uuid",
  "name": "Meeting Room C",
  "capacity": 15,
  "location": "3rd Floor",
  "createdAt": "2026-08-21T16:39:14.122Z"
}
```

**Erros:**
- `401 Unauthorized` - Token ausente ou inválido
- `403 Forbidden` - Usuário não é admin
- `400 Bad Request` - Nome de sala duplicado

---

### 3. Reservas

#### Criar Reserva
```http
POST /reservations
Authorization: Bearer {userToken}
Content-Type: application/json

{
  "roomId": "uuid-da-sala",
  "date": "2026-09-15",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

**Resposta (201 Created):**
```json
{
  "id": "uuid",
  "date": "2026-09-15T03:00:00.000Z",
  "startTime": "2026-09-15T13:00:00.000Z",
  "endTime": "2026-09-15T14:00:00.000Z",
  "status": "CONFIRMED",
  "userId": "uuid",
  "roomId": "uuid",
  "createdAt": "2026-08-21T16:40:20.000Z"
}
```

**Erros:**
- `400 Bad Request` - Formato inválido (date deve ser YYYY-MM-DD, times HH:mm)
- `401 Unauthorized` - Token ausente
- `404 Not Found` - Sala não existe
- `409 Conflict` - Horário já reservado na sala

---

#### Listar Minhas Reservas
```http
GET /reservations/me
Authorization: Bearer {userToken}
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "date": "2026-09-15T03:00:00.000Z",
    "startTime": "2026-09-15T13:00:00.000Z",
    "endTime": "2026-09-15T14:00:00.000Z",
    "status": "CONFIRMED",
    "userId": "uuid",
    "roomId": "uuid",
    "createdAt": "2026-08-21T16:40:20.000Z"
  }
]
```

**Erros:**
- `401 Unauthorized` - Token ausente

---

#### Atualizar Reserva
```http
PATCH /reservations/{id}
Authorization: Bearer {userToken}
Content-Type: application/json

{
  "startTime": "14:00",
  "endTime": "15:00"
}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "date": "2026-09-15T03:00:00.000Z",
  "startTime": "2026-09-15T17:00:00.000Z",
  "endTime": "2026-09-15T18:00:00.000Z",
  "status": "CONFIRMED",
  "userId": "uuid",
  "roomId": "uuid"
}
```

**Erros:**
- `400 Bad Request` - Formato inválido
- `401 Unauthorized` - Token ausente
- `403 Forbidden` - Não é dono da reserva
- `409 Conflict` - Novo horário tem conflito
- `404 Not Found` - Reserva não existe

---

#### Cancelar Reserva
```http
DELETE /reservations/{id}
Authorization: Bearer {userToken}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "date": "2026-09-15T03:00:00.000Z",
  "startTime": "2026-09-15T17:00:00.000Z",
  "endTime": "2026-09-15T18:00:00.000Z",
  "status": "CANCELLED",
  "userId": "uuid",
  "roomId": "uuid"
}
```

**Erros:**
- `401 Unauthorized` - Token ausente
- `403 Forbidden` - Não é dono da reserva
- `404 Not Found` - Reserva não existe

---

## 🔄 Fluxo da Aplicação

### 1. **Inicialização (main.ts)**
```
NestFactory.create(AppModule)
  ↓
helmet() - Headers de segurança
  ↓
enableCors() - Configuração CORS
  ↓
ValidationPipe - Validação global de DTOs
  ↓
HttpExceptionFilter - Tratamento de erros
  ↓
app.listen(PORT)
```

### 2. **Autenticação (Request com Token)**
```
HTTP Request
  ↓
JwtAuthGuard verifica se é @Public()
  ├─ Se @Public() → permite sem token
  └─ Se não → valida JWT
      ↓
      ✓ Token válido → Carrega usuário no request
      ✗ Token inválido/ausente → 401 Unauthorized
  ↓
RolesGuard verifica @Roles() se aplicável
  ├─ Se tem role necessária → continue
  └─ Se não → 403 Forbidden
  ↓
ThrottlerGuard (rate limiting)
  ├─ Se sob limite → continue
  └─ Se limite excedido → 429 Too Many Requests
  ↓
Controller
```

### 3. **Criar Usuário (Register)**
```
POST /auth/register
  ↓
AuthController.register()
  ↓
ValidationPipe valida RegisterDto
  ├─ name (string, min 1)
  ├─ email (email válido)
  └─ password (min 8 caracteres)
  ↓
AuthService.register()
  ↓
bcrypt.hash(password) → passwordHash
  ↓
UsersService.create({name, email, passwordHash})
  ├─ Verifica email duplicado → 400 Bad Request
  └─ Cria user com role: USER (padrão)
  ↓
AuthService.buildAuthResponse()
  ├─ jwt.sign({sub, email, role})
  └─ Retorna {accessToken, user}
  ↓
Response 201 Created
```

### 4. **Fazer Login**
```
POST /auth/login (Rate Limited: 5/min)
  ↓
AuthController.login()
  ↓
ValidationPipe valida LoginDto
  ├─ email (válido)
  └─ password (string)
  ↓
AuthService.login()
  ↓
UsersService.findByEmail(email)
  ├─ Encontrou → bcrypt.compare(password, hash)
  │    ├─ Match → Continue
  │    └─ Não match → 401 Unauthorized
  └─ Não encontrou → 401 Unauthorized
  ↓
AuthService.buildAuthResponse()
  ├─ jwt.sign({sub, email, role})
  └─ Retorna {accessToken, user}
  ↓
Response 200 OK
```

### 5. **Acessar Rota Protegida (ex: GET /rooms)**
```
GET /rooms
Authorization: Bearer {JWT_TOKEN}
  ↓
JwtAuthGuard
  ├─ Decodifica JWT
  ├─ Valida assinatura com JWT_SECRET
  ├─ Valida expiração
  └─ Injeita user no request
  ↓
RolesGuard (se @Roles aplicável)
  ├─ Verifica se user.role está em @Roles([...])
  └─ Se não → 403 Forbidden
  ↓
RoomsController.findAll()
  ↓
RoomsService.findAll()
  ↓
Prisma.room.findMany()
  ↓
Response 200 OK com salas
```

### 6. **Criar Reserva (Fluxo Complexo)**
```
POST /reservations
Authorization: Bearer {USER_TOKEN}
{roomId, date, startTime, endTime}
  ↓
JwtAuthGuard valida token
  ↓
ValidationPipe valida CreateReservationDto
  ├─ roomId (uuid string)
  ├─ date (YYYY-MM-DD)
  ├─ startTime (HH:mm)
  └─ endTime (HH:mm)
  ↓
ReservationsController.create()
  ↓
ReservationsService.create()
  ↓
service.validateTimeWindow(date, startTime, endTime)
  ├─ startTime >= endTime → 400 Bad Request
  ├─ Hora no passado → 400 Bad Request
  └─ OK → continue
  ↓
reservationRepository.findOverlapping(roomId, date, startTime, endTime)
  ├─ Tem conflito → 409 Conflict
  └─ Sem conflito → continue
  ↓
Prisma.reservation.create({
  roomId, userId, date, startTime, endTime, status: CONFIRMED
})
  ↓
Response 201 Created
```

### 7. **Tratamento de Erro Global**
```
Qualquer erro lançado
  ↓
HttpExceptionFilter
  ↓
Formata resposta:
{
  "statusCode": 400|401|403|409|500,
  "timestamp": "2026-08-21T...",
  "path": "/endpoint",
  "message": "Descrição ou array de mensagens",
  "error": "Bad Request|Unauthorized|..."
}
  ↓
Response
```

---

## 🔒 Segurança

### 1. **Autenticação JWT**
- Tokens assinados com `JWT_SECRET`
- Expiração configurável (`JWT_EXPIRES_IN`)
- Estratégia Passport JWT
- Guard `JwtAuthGuard` valida em toda requisição (exceto `@Public()`)

### 2. **Senhas**
- Hash com bcrypt (10 rounds)
- Nunca armazenadas em plain text
- Validação de força: mínimo 8 caracteres

### 3. **Autorização (RBAC)**
- Roles: `USER`, `ADMIN`
- Decorator `@Roles(Role.ADMIN)` restringe endpoints
- Não-admins tentando criar salas → 403 Forbidden

### 4. **Rate Limiting**
- Endpoint `/auth/login` limitado a 5 tentativas/minuto
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Tentativa 6 → 429 Too Many Requests

### 5. **Validação Global**
- DTOs tipadas com `class-validator`
- ValidationPipe rejeita payloads inválidos → 400 Bad Request
- Whitelist + forbidNonWhitelisted (não aceita campos extras)

### 6. **CORS**
- Configurado apenas para `FRONTEND_URL` (padrão: `http://localhost:5173`)
- Previne requisições cross-origin não autorizadas

### 7. **Headers HTTP (Helmet)**
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### 8. **Tratamento de Erros**
- Erros estruturados com status HTTP apropriado
- Mensagens de erro não expõem detalhes internos
- Timestamps para auditoria

---

## 🧪 Testes

### Cobertura de Testes

A suíte cresceu bastante desde a primeira versão deste README. Hoje ela cobre praticamente todas as camadas da aplicação — services, controllers, guards, decorators, filters, a estratégia JWT e o repositório de reservas:

| Camada | Arquivos de teste |
|--------|--------------------|
| Auth | `auth.service.spec.ts`, `auth.controller.spec.ts`, `strategies/jwt.strategy.spec.ts` |
| Users | `users.service.spec.ts` |
| Rooms | `rooms.service.spec.ts`, `rooms.controller.spec.ts` |
| Reservations | `reservations.service.spec.ts`, `reservations.controller.spec.ts`, `reservations.repository.spec.ts` |
| Common | `guards/jwt-auth.guard.spec.ts`, `guards/roles.guard.spec.ts`, `filters/http-exception.filter.spec.ts`, `decorators/decorators.spec.ts` |
| Prisma | `prisma.service.spec.ts` |
| Validação (DTOs) | `validation.dto.spec.ts` |
| App | `app.controller.spec.ts` |

**Total atual: 78 testes em 16 suites, todos passando.**

Além disso, o `package.json` define um piso de **80% de cobertura** (statements, branches, funções e linhas) via `coverageThreshold` do Jest. Se algum PR reduzir a cobertura abaixo disso, `npm run test:cov` falha — é a rede de segurança contra regressões silenciosas.

### Executar Testes

```bash
# Todos os testes
npm run test

# Modo watch (roda ao salvar arquivo)
npm run test:watch

# Cobertura (falha se ficar abaixo de 80%)
npm run test:cov

# Teste específico
npm run test -- auth.service
```

### Exemplos de Testes

#### Auth Service
```typescript
// Register com sucesso
// Login com credenciais válidas
// Login com email/password inválidos → UnauthorizedException
```

#### Reservations Service
```typescript
// Criar reserva com sucesso
// Rejeitar reserva com hora duplicada → ConflictException
// Rejeitar reserva no passado → BadRequestException
// Rejeitar reserva com startTime >= endTime → BadRequestException
// Atualizar reserva com permissão de dono
// Rejeitar atualização sem permissão → ForbiddenException
// Cancelar reserva muda status para CANCELLED
// Listar apenas reservas do usuário
```

#### Guards
```typescript
// JwtAuthGuard valida token válido
// JwtAuthGuard rejeita token inválido → UnauthorizedException
// JwtAuthGuard permite @Public() sem token
// RolesGuard rejeita role incorreta → ForbiddenException
```

---

## 💾 Banco de Dados

### Schema Prisma

#### User
```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  role         Role          @default(USER)
  createdAt    DateTime      @default(now())
  reservations Reservation[]
}
```

#### Room
```prisma
model Room {
  id           String        @id @default(uuid())
  name         String        @unique
  capacity     Int
  location     String?
  createdAt    DateTime      @default(now())
  reservations Reservation[]
}
```

#### Reservation
```prisma
model Reservation {
  id        String            @id @default(uuid())
  date      DateTime
  startTime DateTime
  endTime   DateTime
  status    ReservationStatus @default(CONFIRMED)
  userId    String
  roomId    String
  user      User              @relation(fields: [userId], references: [id])
  room      Room              @relation(fields: [roomId], references: [id])
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  @@index([roomId, date])
}
```

#### Enums
```prisma
enum Role {
  USER
  ADMIN
}

enum ReservationStatus {
  CONFIRMED
  CANCELLED
}
```

### Migrations

```bash
# Criar migration
npx prisma migrate dev --name descricao

# Aplicar migrations
npx prisma migrate deploy

# Ver status
npx prisma migrate status
```

### Seed (Dados de Teste)

Executar:
```bash
npx ts-node prisma/seed.ts
```

Cria:
- **Admin**: `admin@example.com` / `admin123456` (role: ADMIN)
- **User**: `user@example.com` / `user1234567` (role: USER)
- **Rooms**: Meeting Room A, B, C

---

## 📋 Checklist de Validação

- ✅ Backend rodando sem erros
- ✅ POST /auth/register - cria usuário
- ✅ POST /auth/login - retorna JWT
- ✅ GET /rooms - lista salas (requer token)
- ✅ POST /rooms - cria sala (requer ADMIN)
- ✅ POST /reservations - cria reserva
- ✅ GET /reservations/me - lista minhas reservas
- ✅ PATCH /reservations/:id - atualiza reserva
- ✅ DELETE /reservations/:id - cancela reserva
- ✅ Sem token → 401 Unauthorized
- ✅ USER tentando POST /rooms → 403 Forbidden
- ✅ Login em massa → 429 Too Many Requests
- ✅ Payload inválido → 400 Bad Request
- ✅ Conflito de horário → 409 Conflict
- ✅ Headers de segurança (Helmet, CORS, HSTS)
- ✅ 78 testes unitários passando em 16 suites
- ✅ Cobertura mínima de 80% (statements, branches, funções e linhas)
- ✅ Rate limiting funcionando
- ✅ Banco de dados com seed

---

## � Por que Prisma? Alternativas de Banco de Dados

### 🎯 Justificativa para Usar Prisma

O **Prisma ORM** foi escolhido por:

1. **Type Safety Total**
   - Schema declarativo gera tipos TypeScript automáticos
   - Erros de query capturados em tempo de compilação
   - Autocomplete perfeito no IDE

2. **Developer Experience**
   - `schema.prisma` é legível e mantível
   - Migrations automáticas com versionamento
   - Prisma Studio para visualizar dados

3. **Flexibilidade de Banco de Dados**
   - Mesmo código funciona com SQLite, PostgreSQL, MySQL, MariaDB, SQL Server, MongoDB
   - Troca de banco apenas alterando `DATABASE_URL` e provider
   - Sem reescrever queries ou lógica

4. **Performance**
   - Queries otimizadas automaticamente
   - Connection pooling nativo
   - Lazy loading e eager loading configurável

5. **Comunidade & Documentação**
   - Documentação excelente
   - Stack Overflow ativo
   - Suporte oficial para NestJS

---

### 📊 Comparação: SQLite vs PostgreSQL vs MySQL vs Neon

| Aspecto | SQLite | PostgreSQL (Docker) | MySQL (Docker) | Neon (Cloud) |
|---------|--------|-------------------|---------------|----|
| **Setup** | ✅ Zero config | ⏱️ Docker + compose | ⏱️ Docker + compose | ⚡ 1 clique |
| **Ideal para** | Dev local | Prod on-premise | Prod on-premise | Prod cloud |
| **Performance** | 📊 Arquivo | 🚀 Muito alta | 🚀 Muito alta | 🚀 Muito alta |
| **Escalabilidade** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim |
| **Backups** | 📁 Manual | 🤖 Automático | 🤖 Automático | 🤖 Automático |
| **Custo** | Grátis | Grátis (self-hosted) | Grátis (self-hosted) | $0-99/mês |
| **Concorrência** | ❌ Limitada | ✅ Alta | ✅ Alta | ✅ Alta |
| **Replicação** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim |

---

## 🗄️ Opções de Configuração

### 1️⃣ SQLite (Atual) - Desenvolvimento Local

**Ideal para:** Desenvolvimento, testes, prototipagem

**Arquivo `.env`:**
```bash
DATABASE_URL="file:./dev.db"
```

**Vantagens:**
- ✅ Zero dependências externas
- ✅ Arquivo local (fácil backup com git)
- ✅ Perfeito para dev offline
- ✅ Sem Docker necessário

**Desvantagens:**
- ❌ Não é production-ready
- ❌ Não suporta múltiplos usuários
- ❌ Performance limitada com muitos dados
- ❌ Locks de arquivo em escrita

**Migrar para outra opção:** Apenas trocar `DATABASE_URL` e executar `npx prisma migrate deploy`

---

### 2️⃣ PostgreSQL (Docker) - Produção On-Premise

**Ideal para:** Produção em servidor próprio/empresa

**Pré-requisitos:**
```bash
# Instalar Docker
# https://docs.docker.com/get-docker/
```

**Docker Compose (`docker-compose.yml` na raiz do backend):**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: meeting_room_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: senha_super_segura_123
      POSTGRES_DB: meeting_room
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Arquivo `.env` para PostgreSQL:**
```bash
DATABASE_URL="postgresql://admin:senha_super_segura_123@localhost:5432/meeting_room?schema=public"
```

**Iniciar banco:**
```bash
# Subir container PostgreSQL
docker-compose up -d

# Aplicar schema e migrations
npx prisma migrate deploy

# Popolar com dados de teste
npx ts-node prisma/seed.ts
```

**Parar banco:**
```bash
docker-compose down

# Com backup dos dados
docker-compose down -v  # Remove volumes também
```

**Conectar via cliente GUI:**
```bash
# pgAdmin (web-based)
docker run -d \
  --name pgadmin \
  --link meeting_room_db:postgres \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -p 5050:80 \
  dpage/pgadmin4
# Acessar: http://localhost:5050
```

**Vantagens:**
- ✅ Enterprise-ready
- ✅ ACID transactions
- ✅ JSON/JSONB support
- ✅ Full-text search
- ✅ Replicação nativa
- ✅ Performance superior

**Desvantagens:**
- ⏱️ Setup mais complexo
- 💰 Requer infraestrutura
- 🔧 Manutenção necessária

---

### 3️⃣ MySQL (Docker) - Produção On-Premise (Alternativa)

**Ideal para:** Produção em servidor próprio, compatibilidade com stack existente

**Docker Compose (`docker-compose.yml`):**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0-alpine
    container_name: meeting_room_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password_123
      MYSQL_DATABASE: meeting_room
      MYSQL_USER: appuser
      MYSQL_PASSWORD: app_password_123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

**Arquivo `.env` para MySQL:**
```bash
DATABASE_URL="mysql://appuser:app_password_123@localhost:3306/meeting_room"
```

**Iniciar banco:**
```bash
docker-compose up -d
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

**Conectar via cliente GUI:**
```bash
# MySQL Workbench (recomendado)
# Download: https://dev.mysql.com/downloads/workbench/

# Ou usar DBeaver (multi-database)
# Download: https://dbeaver.io/
```

**Prisma Schema (sem mudanças):**
```prisma
datasource db {
  provider = "mysql"  # ← Apenas isto muda
  url      = env("DATABASE_URL")
}
```

**Vantagens:**
- ✅ Muito popular (80% dos servidores web)
- ✅ Performance boa
- ✅ Fácil backup/replicação
- ✅ Custo baixo de hosting

**Desvantagens:**
- ⚠️ Menos features que PostgreSQL
- ⚠️ JSON support limitado
- ⚠️ Full-text search menos poderoso

---

### 4️⃣ Neon (Cloud) - Produção Serverless

**Ideal para:** Produção cloud, sem gerenciar infraestrutura, escala automática

**Passo 1: Criar conta**
```
https://console.neon.tech
Inscrever-se com GitHub/Google
```

**Passo 2: Criar projeto**
```
1. New Project
2. Database: PostgreSQL 16
3. Region: Mais próxima do usuário
4. Tier: Free (até 3GB dados) ou paid
```

**Passo 3: Copiar connection string**
```
Neon Dashboard → Connection String
Format: postgresql://user:password@host/database?sslmode=require
```

**Arquivo `.env` para Neon:**
```bash
# Exemplo real (gerado pelo Neon)
DATABASE_URL="postgresql://neondb_owner:AbCdEfGhIjKlMnOp@ep-cool-shape-123.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Aplicar migrations (automático via Neon Console ou CLI):**
```bash
# Via Neon CLI
npm install -g neon
neon auth

# Via Prisma (padrão)
npx prisma migrate deploy

# Via Neon SQL Editor (GUI web)
# Copiar conteúdo de prisma/migrations em SQL puro
```

**Vantagens:**
- ✅ Zero setup/manutenção
- ✅ Auto-scaling
- ✅ Backups automáticos
- ✅ SSL/TLS por padrão
- ✅ Connection pooling nativo
- ✅ Suporte PostgreSQL completo
- ✅ Tier free generoso

**Desvantagens:**
- 💰 Pode ficar caro com escala
- 🌐 Dependência de cloud provider
- ⏱️ Latência de rede

**Dashboard Neon:**
```
https://console.neon.tech/app/projects
- Gerenciar branches
- Backups
- Query logs
- Metrics
```

---

## 🔄 Como Migrar Entre Opções

### SQLite → PostgreSQL (Docker)

**1. Instalar Docker e criar container:**
```bash
docker-compose up -d
```

**2. Alterar `.env`:**
```bash
# De:
DATABASE_URL="file:./dev.db"

# Para:
DATABASE_URL="postgresql://admin:senha@localhost:5432/meeting_room?schema=public"
```

**3. Atualizar Prisma:**
```bash
# Alterar schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**4. Aplicar schema:**
```bash
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

**5. Verificar conexão:**
```bash
npx prisma studio
# Abrirá interface web para visualizar dados
```

**Toda lógica do código permanece igual!** Apenas a conexão muda.

---

### PostgreSQL (Docker) → Neon (Cloud)

**1. Alterar `.env`:**
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

**2. Aplicar migrations:**
```bash
npx prisma migrate deploy
```

**3. Exportar dados (opcional):**
```bash
# Do Docker PostgreSQL
docker exec meeting_room_db pg_dump -U admin meeting_room > backup.sql

# Importar para Neon (via Neon Console SQL)
```

**Novamente: código inalterado!** É só mudar connection string.

---

## 🚀 Recomendação por Cenário

| Cenário | Recomendação | Razão |
|---------|--------------|-------|
| 👨‍💻 Dev individual | **SQLite** | Zero setup, perfeito para prototipagem |
| 🏢 Empresa on-premise | **PostgreSQL Docker** | Controle total, escalável, open-source |
| 🛒 E-commerce pequeno | **Neon Free** | Serverless, sem manutenção, free tier |
| 🌍 SaaS em crescimento | **Neon Paid** | Auto-scaling, backups, sem ops |
| 🔧 Stack existente MySQL | **MySQL Docker** | Compatibilidade com infraestrutura |
| 📊 Big data + analytics | **PostgreSQL** | Queries complexas, JSONB, extensions |

---

## ✅ Conclusão: Por que Prisma?

Ao usar **Prisma com schema declarativo**, você consegue:

1. ✅ Começar com SQLite em 5 minutos
2. ✅ Migrar para PostgreSQL/MySQL/Neon **sem mudar uma linha de código**
3. ✅ Ter tipos TypeScript automáticos
4. ✅ Reversibilidade: voltar de Neon para Docker sem problemas
5. ✅ Database-agnostic: melhor tecnologia para cada fase

**Resumo:** Prisma permite você **usar a tecnologia certa em cada momento** sem refatoração futura.

---

## 🚀 Deploy

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main.js"]
```

Build:
```bash
docker build -t meeting-room-api .
docker run -p 3001:3001 --env-file .env meeting-room-api
```

### Environment Production

Ajuste `.env` para produção:
```bash
JWT_SECRET="use-uma-chave-super-segura-complexa"
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NODE_ENV="production"
PORT=3001
```

---

## 📞 Suporte & Documentação

- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **JWT**: https://jwt.io
- **Helmet**: https://helmetjs.github.io
- **Class Validator**: https://github.com/typestack/class-validator

---

## 📄 Licença

Este projeto está sob a licença UNLICENSED.

---

**Última atualização:** 23 de agosto de 2026
**Status:** ✅ Pronto para Produção


## schema prisma
```bash
# validate
npx prisma validate
# create or update Prisma Client
npx prisma generate
```

- Doc - [https://www.prisma.io/docs] 

## Migrations do banco de dados

As migrations registram no Git cada alteração feita no modelo do banco. Elas devem ser criadas sempre que o arquivo `prisma/schema.prisma` for alterado.

### Criar uma migration

```bash
npx prisma migrate dev --name nome-da-alteracao
```

Esse comando compara o schema com o banco local, gera o SQL da alteração, aplica a migration no banco SQLite de desenvolvimento e atualiza o Prisma Client quando necessário.

Não é necessário executar esse comando ao iniciar o projeto. Ele deve ser usado somente depois de uma alteração no schema.

### Comandos relacionados

```bash
# Verifica se o schema é válido
npx prisma validate

# Regenera o Prisma Client
npx prisma generate

# Cria uma migration e aplica no banco de desenvolvimento
npx prisma migrate dev --name nome-da-alteracao
```

Para mudanças permanentes no modelo, prefira `migrate dev` em vez de `prisma db push`, pois a migration mantém um histórico versionado e reproduzível.

### Fluxo recomendado

1. Alterar `prisma/schema.prisma`.
2. Validar o schema com `npx prisma validate`.
3. Criar a migration com `npx prisma migrate dev --name nome-da-alteracao`.
4. Verificar a aplicação e os testes.
5. Commitar o schema e a pasta `prisma/migrations/` juntos.


