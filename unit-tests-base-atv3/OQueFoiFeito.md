# 📑 Descrição das Atividades Realizadas

O objetivo era implementar uma **suíte de testes de integração** para uma API Node.js, cobrindo todas as funcionalidades de **Usuário** (registro, login, logout) e **Contatos** (CRUD).  
Para isso, construímos um ambiente de testes robusto, automatizado e isolado.

---

## 🚀 Etapas do Processo

### 1. Escrita dos Casos de Teste
- Foram criados dois arquivos principais de teste na pasta `test`:
  - `user.test.ts`
  - `contact.test.ts`
- Utilizamos a biblioteca **Supertest** para simular requisições HTTP reais (`POST`, `GET`, `PUT`, `DELETE`) aos endpoints da API, garantindo que os testes fossem o mais próximo possível do uso real.
- Utilizamos o **Jest** para estruturar os testes com `describe` e `it`, e para validar os resultados com asserções (`expect`), verificando:
  - códigos de status  
  - mensagens de erro  
  - dados retornados  

📌 Instale as dependências necessárias:
```bash
npm install --save-dev supertest ts-jest @types/jest @types/supertest
```

### 2. 🐳 Criação de um Ambiente de Teste Isolado com Docker

- Utilizamos o Docker para garantir que os testes não interferissem com o ambiente de desenvolvimento e que sempre rodassem em um ambiente limpo.
- Foi criado o arquivo `docker-compose.test.yml`, que define os serviços:
  - **Banco de dados PostgreSQL** (porta 5433)
  - **Cache Redis** (porta 6380)
- Estes serviços foram configurados para rodar em portas diferentes das usadas em desenvolvimento, evitando conflitos.

### 3. ⚙️ Automação da Execução (Orquestração)

- O arquivo `package.json` foi modificado para automatizar todo o processo.
- O comando `npm test` foi transformado em um orquestrador que executa três etapas em sequência:
  1. `npm run test:up`: Inicia os contêineres Docker (PostgreSQL e Redis)
  2. `jest`: Executa todos os arquivos de teste encontrados na pasta `test/`
  3. `npm run test:stop`: Desliga os contêineres Docker, deixando o ambiente limpo

📌 **Para projetos TypeScript, inclua a configuração do Jest no `package.json`:**

```json
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": [
    "<rootDir>/test/**/*.test.ts"
  ]
}
```

### 4. 🔧 Separação das Configurações de Ambiente

- Foi criado um arquivo `.env.test` para armazenar as variáveis de ambiente específicas para o ambiente de teste (credenciais e portas do Docker).
- O script de teste no `package.json` foi ajustado para usar o pacote `dotenv-cli`, forçando o Jest a carregar as configurações do `.env.test` em vez do `.env` de desenvolvimento.
- Isso garantiu que os testes se conectassem ao banco de dados correto.

### 5. 🗄️ Preparação Dinâmica do Banco de Dados

- O banco de dados criado pelo Docker era totalmente vazio, causando o erro inicial **"tabela não existe"**.
- **Solução implementada:**
  - Criamos um script de inicialização: `test/setup.ts`
  - Configuramos o Jest para executar este script uma única vez antes de todos os testes
  - O script lê o arquivo `src/configs/comandos.sql` e cria as tabelas `users` e `contacts` no banco de dados de teste

### 6. 🐛 Refinamento e Depuração

Durante o processo, foram corrigidos pequenos bugs, como:

- Caminho incorreto da pasta de testes no `package.json`
- Checagem da mensagem de erro no teste de "usuário duplicado"
- Garantia de que as expectativas dos testes correspondessem exatamente ao comportamento da API

---

## 🚨 Resolução de Problemas Comuns

### Erro: "Cannot use import statement outside a module"

**Solução:**

1. Instale as dependências necessárias:

   ```bash
   npm install --save-dev ts-jest @types/jest
   ```

2. Configure o Jest no `package.json`:

   ```json
   "jest": {
     "preset": "ts-jest",
     "testEnvironment": "node",
     "testMatch": [
       "<rootDir>/test/**/*.test.ts"
     ]
   }
   ```

### Erro: "Não é possível localizar o módulo 'supertest'"

**Solução:**

```bash
npm install --save-dev supertest @types/supertest
```

---

✅ **Se precisar de exemplos de configuração ou scripts, posso inserir diretamente no projeto.**