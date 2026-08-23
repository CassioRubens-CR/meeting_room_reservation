# Meeting Room Reservation

Sistema web para gerenciamento e reserva de salas de reunião. Usuários podem criar uma conta, consultar salas disponíveis, realizar reservas e gerenciar seus próprios agendamentos. Administradores possuem recursos adicionais para gerenciar salas e realizar reservas com mais de um participante, informando uma justificativa.

## O que o projeto oferece

- Cadastro e login com autenticação.
- Dashboard após o login.
- Listagem de salas disponíveis.
- Criação de reservas com data e horário.
- Edição e cancelamento de reservas.
- Exibição de participantes e justificativas.
- Perfil com alteração de senha.
- Gerenciamento administrativo de salas.
- Menu responsivo para desktop e mobile.
- Confirmação visual para exclusão de salas e cancelamento de reservas.

## Tecnologias

### Backend

- NestJS
- TypeScript
- Prisma
- SQLite
- JWT
- Passport
- bcrypt
- class-validator
- Helmet

### Frontend

- React
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS

## Estrutura

```text
meeting_room_reservation/
├── backend/    # API, autenticação, regras e banco
├── frontend/   # Interface web
└── README.md   # Visão geral do projeto
```

## Pré-requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- Git.

## Instalação

Clone o projeto e instale as dependências de cada parte:

```bash
git clone <url-do-repositorio>
cd meeting_room_reservation

cd backend
npm install

cd ../frontend
npm install
```

## Configuração do backend

Crie `backend/.env` a partir do exemplo:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="uma-chave-secreta-local"
JWT_EXPIRES_IN="1d"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

Prepare o banco:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

Para criar os usuários e salas padrão:

```bash
npx prisma db seed
```

O seed cria:

```text
Admin User   | admin@example.com | admin123456
Regular User | user@example.com  | user1234567
```

Também cria:

- Sala de Reunião A, com 10 lugares.
- Sala de Reunião B, com 20 lugares.

> Atenção: o seed atual limpa usuários, salas e reservas antes de recriar os dados padrão. Não execute o seed em um banco que contenha dados que deseja preservar.

## Execução

Abra dois terminais.

Terminal do backend:

```bash
cd backend
npm run start:dev
```

API:

```text
http://localhost:3001
```

Terminal do frontend:

```bash
cd frontend
npm run dev
```

Aplicação:

```text
http://localhost:5173
```

## Fluxos disponíveis

### Usuário comum

1. Acessar a tela de cadastro.
2. Criar uma conta.
3. Ser direcionado ao dashboard.
4. Consultar salas disponíveis.
5. Criar uma reserva.
6. Consultar suas reservas.
7. Editar uma reserva.
8. Cancelar uma reserva.
9. Acessar o perfil.
10. Alterar a senha informando a senha atual.
11. Encerrar a sessão pelo menu do usuário.

### Administrador

O ADMIN possui todos os fluxos do usuário comum e também pode:

1. Acessar a área de administração.
2. Cadastrar salas.
3. Editar salas.
4. Excluir salas sem reservas vinculadas.
5. Receber uma mensagem explicativa ao tentar excluir sala com reservas.
6. Reservar mais de um lugar da sala.
7. Reservar a sala completa dentro da capacidade disponível.
8. Informar uma justificativa para reservas com mais de um participante.

### Regras principais de reserva

- A reserva exige data, horário inicial e horário final.
- A duração mínima é de uma hora.
- Não é permitido reservar no passado.
- Horários devem usar o formato `HH:mm`.
- Usuários comuns reservam um lugar por vez.
- ADMIN pode informar mais de um participante.
- A quantidade não pode exceder a capacidade da sala.
- Reservas sobrepostas são avaliadas pela ocupação total da sala.
- Uma reserva que ocupa todos os lugares impede outra reserva no mesmo intervalo.
- Reservas canceladas não ocupam capacidade.

## Banco de dados

O ambiente local usa SQLite em:

```text
backend/prisma/dev.db
```

Para visualizar os dados:

```bash
cd backend
npx prisma studio --port 5555
```

Acesse:

```text
http://localhost:5555
```

Para preservar os dados, use migrations e evite `npx prisma db seed` e `npx prisma migrate reset`.

## Validação

Backend:

```bash
cd backend
npm test -- --runInBand
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Documentação detalhada

- [Documentação técnica do backend](backend/README.md)
- [Documentação técnica do frontend](frontend/README.md)
