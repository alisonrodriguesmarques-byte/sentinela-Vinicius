# SENTINELA HMV

Protótipo funcional e editável do sistema hospitalar **SENTINELA**, criado para o conceito do **HMV — Hospital Municipal de Valparaíso de Goiás**.

> **Importante:** este projeto é demonstrativo. Os profissionais, CRM/RQE, fluxos clínicos e dados cadastrados são dados de protótipo. Não use este sistema em ambiente assistencial real sem validação técnica, jurídica, clínica, de segurança e de proteção de dados.

## O que já está incluído

- **Login exclusivo de profissionais** (Médico, Atendimento, Triagem, Almoxarifado e Admin).
- **Cadastro e edição de pacientes somente por Atendimento e Admin**, com CPF, gênero, telefone e endereço, sem senha nem conta própria do paciente.
- **Gestão de profissionais pelo Admin:** criação de novas contas, escolha do perfil, especialidade médica, exclusão e reativação de acessos.
- Preenchimento de endereço por CEP usando **ViaCEP**.
- Tema claro/escuro.
- Listagem de pacientes para profissionais autorizados.
- Cadastro de consultas por médico, data e horário.
- Lista de médicos e especialidades do protótipo.
- Solicitação de exames.
- Solicitação de avaliação cirúrgica.
- Agendamento de doação de sangue.
- Área médica com agenda, pacientes, triagem, prescrições, exames e cirurgias.
- Área de triagem.
- Área de atendimento e fila hospitalar.
- Chamada de pacientes para TV.
- Página `/tv` com atualização automática.
- Área administrativa com indicadores e logs.
- **Almoxarifado integrado** com estoque, entrada, saída, solicitações de setores, fornecedores, lotes, validade e histórico de movimentações.
- Profissionais de Médico, Triagem e Atendimento podem enviar **solicitações de materiais** ao Almoxarifado.
- Controle de atendimento **Convênio ou Particular** em consultas e na fila de atendimento, com dados de autorização/pagamento.
- Persistência dos dados em `data/db.json`.
- Senhas armazenadas com hash usando `bcryptjs`.
- Sessões no servidor.
- Controle básico de acesso por perfil.
- Design responsivo inspirado na referência enviada, usando azul, verde, amarelo e branco.

## Requisitos

- Node.js 18 ou superior.
- npm.

## Como abrir no VS Code

No Windows, você também pode dar dois cliques em `INICIAR-WINDOWS.bat` depois de extrair o projeto. Na primeira execução ele tentará instalar as dependências e abrir o navegador.


1. Extraia a pasta do projeto.
2. Abra a pasta `sentinela-hmv-atualizado` no VS Code.
3. Abra o terminal integrado.
4. Rode:

```bash
npm install
```

5. Depois rode:

```bash
npm start
```

6. Abra no navegador:

```text
http://localhost:3000
```

Para verificar as permissões de cadastro sem alterar o banco do projeto, execute `npm test` no terminal. Os testes usam um banco temporário.

### Atalho direto para Admin (apenas demonstração local)

Para uma apresentação no seu próprio computador, execute `npm run demo` no terminal ou abra `INICIAR-WINDOWS.bat`. Na tela de login, pressione **Ctrl + Alt + A**: o sistema entra automaticamente no painel Admin sem pedir senha.

Esse atalho só é habilitado no modo demonstrativo e em conexões locais (`localhost`/`127.0.0.1`). Ele permanece desativado com `npm start` e em produção. **Nunca use dados reais de pacientes nesse modo.**

A TV de chamada fica em:

```text
http://localhost:3000/tv
```

## Logins profissionais de demonstração

| Perfil | Usuário | Senha |
|---|---|---|
| Médico | `MEDICO` | `123456` |
| Atendimento | `ATENDIMENTO` | `123456` |
| Triagem | `TRIAGEM` | `123456` |
| Almoxarifado | `ALMOXARIFADO` | `123456` |
| Administrador | `ADMIN` | `123456` |

Essas contas servem apenas para desenvolvimento.

## Atualização — Gestão de profissionais pelo Admin

1. Entre com a conta `ADMIN` e abra **Profissionais** no menu.
2. Clique em **Novo profissional**.
3. Informe nome completo, usuário de login e senha inicial com pelo menos 8 caracteres.
4. Escolha o perfil: **Médico**, **Atendimento**, **Triagem**, **Almoxarifado** ou **Administrador**.
5. Se escolher **Médico**, selecione a especialidade (como Clínica Geral, Pediatria, Cardiologia ou Cirurgia Geral) e, se desejar, informe CRM e RQE demonstrativos.
6. Clique em **Criar profissional**. A nova conta já poderá entrar pelo login do SENTINELA e terá as permissões do perfil escolhido.

Quando um médico é cadastrado, o sistema também cria seu registro na lista de médicos disponível para consultas ou avaliações cirúrgicas. As consultas desse médico aparecem na própria agenda dele. As especialidades disponíveis são obtidas dos registros médicos do próprio projeto.

Na tabela de profissionais, o botão **Excluir** desativa a conta imediatamente, bloqueia o login e o acesso de sessões já abertas e, quando se tratar de médico, remove seu nome das novas opções de agendamento. Os atendimentos e históricos anteriores são preservados. O botão **Reativar** restaura esse acesso. O administrador não pode excluir a própria conta.

Todas essas operações são protegidas no servidor, registradas no histórico de auditoria e as senhas são armazenadas com hash. Este é um protótipo; o uso real exige validação de registro profissional, proteção de dados e políticas de autenticação mais fortes.

## Atualização — Acesso e cadastro de pacientes

- A tela inicial apresenta **somente o login profissional**. Não existe mais login, registro público ou portal do paciente.
- **Atendimento:** abra **Cadastrar pacientes** no menu, clique em **Cadastrar paciente** e preencha os dados. Em **Novo atendimento**, o botão **Novo paciente** permite cadastrá-lo antes de incluí-lo na fila.
- **Admin:** abra **Pacientes** e clique em **Cadastrar paciente**. Admin e Atendimento também podem editar cadastros existentes.
- **Médico e Triagem:** consultam pacientes nas áreas permitidas, mas não podem criar ou editar cadastros.
- Cada registro grava o profissional responsável e um evento de auditoria. CPF duplicado é bloqueado.
- As rotas `POST /api/patients` e `PATCH /api/patients/:id` verificam as permissões no servidor. As antigas rotas públicas de autenticação dos pacientes foram removidas.
- Os dados dos pacientes já existentes continuam no banco, mas eles não recebem usuário ou senha.

## Atualização — Almoxarifado + Convênio/Particular

O módulo de Almoxarifado usa o mesmo login, banco e sistema de auditoria do SENTINELA. O estoque é alterado de verdade no arquivo `data/db.json`: entradas aumentam a quantidade, saídas diminuem e o backend impede estoque negativo. Solicitações feitas pelos setores passam por status de pendente, análise, aprovação, entrega ou recusa.

O atendimento também passou a registrar **Convênio** ou **Particular**. Para convênio, o protótipo registra plano, carteirinha e status de autorização; para particular, registra forma/status de pagamento e valor informado. Esses dados são demonstrativos e não substituem faturamento hospitalar real nem integração oficial com operadoras.

## Estrutura

```text
sentinela-hmv-atualizado/
├─ data/
│  └─ db.json
├─ public/
│  ├─ assets/
│  │  └─ hmv-logo.png
│  ├─ app.js
│  ├─ index.html
│  ├─ style.css
│  ├─ tv.html
│  ├─ tv.css
│  └─ tv.js
├─ package.json
├─ package-lock.json
├─ demo.js
├─ README.md
├─ tests/
│  ├─ demo-admin-shortcut.test.js
│  ├─ patient-access.test.js
│  └─ professional-management.test.js
└─ server.js
```

## Arquivos principais

- `server.js`: backend, autenticação, APIs e persistência.
- `public/index.html`: estrutura do login profissional e painel interno.
- `public/style.css`: todo o design do sistema.
- `public/app.js`: lógica das telas e integração com as APIs.
- `public/tv.html`: TV de chamada.
- `data/db.json`: banco JSON local do protótipo.

## Produção

Antes de publicar de verdade, substitua o banco JSON por um banco robusto como PostgreSQL, configure um armazenamento de sessão persistente, HTTPS, backups, políticas LGPD, auditoria avançada, validação clínica, controle de permissões granular e gerenciamento de segredos.

Também troque a chave de sessão por uma variável de ambiente:

```text
SESSION_SECRET=uma-chave-grande-e-aleatoria
```

## Prescrição / segurança clínica

O protótipo inclui apenas verificações simples de preenchimento. Ele **não calcula dose segura, não diagnostica, não recomenda medicamentos e não valida interação medicamentosa real**. Qualquer recurso desse tipo para uso real precisaria de fonte farmacológica validada, protocolo institucional e supervisão profissional.
