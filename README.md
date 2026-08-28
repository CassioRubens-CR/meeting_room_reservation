# Meeting Room Reservation

Sistema web full-stack corporativo para gerenciamento e reserva de salas de reunião.A aplicação resolve o problema de concorrência de espaços físicos em ambientes de trabalho, oferecendo fluxos com regras de negócio complexas tanto para colaboradores comuns quanto para administradores.

Usuários podem criar uma conta, consultar salas disponíveis, realizar reservas e gerenciar seus próprios agendamentos. Administradores possuem recursos adicionais para gerenciar salas e realizar reservas com mais de um participante.


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

## 🚀 Aplicação publicada - Links do Projeto & Demonstração

A aplicação completa está em produção na plataforma **Render**:

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

## 📐 Decisões de Arquitetura & Tech Stack

### 📦 Arquitetura Monorepo: Tudo em um só lugar

Este projeto foi estruturado utilizando o padrão **Monorepo**. Em vez de isolar o ecossistema em repositórios separados, o Frontend e o Backend coexistem de forma harmoniosa nesta mesma estrutura. 

#### 🌟 Por que Monorepo?
*   **Single Source of Truth (Fonte Única de Verdade):** Todo o ciclo de vida da aplicação (da API à Interface UI) é rastreado em um único histórico de commits.
*   **Orquestração Simplicada:** Automação total do ambiente local através de scripts unificados na raiz do projeto (`run.sh` / `run.ps1`), permitindo instalar e rodar os dois microsserviços em paralelo com um único comando.
*   **Facilidade de Code Review:** Avaliadores técnicos e recrutadores conseguem analisar a consistência de ponta a ponta (Fullstack) sem precisar alternar entre abas ou repositórios diferentes no GitHub.

### Backend
*   **NestJS & TypeScript:** Escolhido pela arquitetura modular baseada em injeção de dependências, garantindo escalabilidade, facilidade de testes unitários e aplicação natural dos princípios **SOLID**.
*   **Prisma ORM + SQLite:** Agilidade na modelagem de dados e facilidade de portabilidade do ambiente com migrations estruturadas.
*   **Segurança:** Implementação de JWT via Passport, criptografia de senhas com `bcrypt` e proteção de cabeçalhos HTTP usando `Helmet`.

### Frontend
*   **React + Vite:** Ambiente de desenvolvimento ultra-rápido focado em performance.
*   **Zustand:** Gerenciamento de estado global leve, escalável e sem o boilerplate excessivo do Redux.
*   **Tailwind CSS:** Estilização focada em utilitários, garantindo responsividade mobile/desktop nativa e consistente.

---

## 🛠️ Tecnologias

### ⚙️ Backend

- NestJS
- TypeScript
- Prisma
- SQLite
- JWT
- Passport
- bcrypt
- class-validator
- Helmet

### 🖥️ Frontend

- React
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS

## 📁 Estrutura

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

## ⚡ Instalação

Clone o projeto e instale as dependências de cada parte:

```bash
git clone https://github.com/CassioRubens-CR/meeting_room_reservation.git
cd meeting_room_reservation

cd backend
npm install

cd ../frontend
npm install
```

## ⚡ Executar o projeto com um comando

Como o projeto possui frontend e backend separados, a raiz também oferece scripts para iniciar os dois serviços juntos. Eles apenas chamam os comandos oficiais de cada pacote e não substituem a execução individual documentada nas pastas `frontend/` e `backend/`.

### Windows PowerShell

```powershell
.\run.ps1 -Install
.\run.ps1
```

Use `-Install` somente na primeira execução ou quando as dependências precisarem ser reinstaladas. Para permitir scripts locais no PowerShell, se necessário:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### macOS, Linux ou Git Bash

```bash
./run.sh --install
./run.sh
```

Os scripts iniciam:

- Backend em `http://localhost:3001`
- Frontend em `http://localhost:5173`

No Windows, cada serviço é aberto em uma janela própria do PowerShell. No macOS, Linux e Git Bash, os dois processos compartilham o terminal. Use `Ctrl+C` para encerrar a execução no `run.sh`; no PowerShell, feche o terminal que iniciou o script.

## ⚙️ Configuração do backend

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
- A quantidade informada não pode exceder a capacidade total da sala.
- Reservas sobrepostas são avaliadas pela ocupação total da sala.
- Uma reserva que ocupa todos os lugares impede outra reserva no mesmo intervalo.
- Reservas canceladas não ocupam capacidade.
- Usuários comuns não podem criar reservas sobrepostas na mesma sala e horário.
- ADMIN pode consolidar uma nova solicitação no mesmo dia, sala e horário exato de uma reserva própria.
- Na consolidação, os participantes são somados e uma nova justificativa é obrigatória.
- Se a capacidade restante não for suficiente, a API informa a quantidade de vagas disponíveis.

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

##  🧪 Cobertura de testes

Backend e frontend têm uma suíte de testes automatizados (Jest e Vitest, respectivamente) com um piso mínimo de **80% de cobertura** em statements, branches, funções e linhas. Se a cobertura cair abaixo disso, o comando termina com erro — é a forma de garantir que o projeto não regrida silenciosamente.

```bash
cd backend
npm run test:cov
```

```bash
cd frontend
npm run test:cov
```

No momento, os dois lados estão bem acima do piso combinado (na casa dos 90%+ em quase todas as métricas), então há uma boa margem para crescer o código sem quebrar a regra.

## Documentação detalhada

- [Documentação técnica do backend](backend/README.md)
- [Documentação técnica do frontend](frontend/README.md)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.


## 📄 Licença e Uso

Este é um projeto desenvolvido estritamente para fins de **desafio técnico e portfólio pessoal**. 

O código é livre para estudos, consultas e inspiração. Caso queira utilizar alguma parte da arquitetura ou dos scripts automatizados no seu próprio projeto, sinta-se à vontade! Um "star" ⭐️ no repositório seria muito apreciado.

---

<p align="center">Desenvolvido com ☕ e código por Cássio Rubens • Licença MIT © 2026</p>
