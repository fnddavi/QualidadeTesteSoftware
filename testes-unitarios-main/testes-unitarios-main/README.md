## Qualidade e Testes de Software

Este repositório contém o código desenvolvido para a aula sobre **Testes Unitários utilizando Jest**, com ênfase na validação automatizada de funcionalidades de uma API Node.js escrita em TypeScript.  
O projeto aborda desde conceitos introdutórios sobre testes até a aplicação prática de operações CRUD integradas a um banco de dados MongoDB, com o uso de um servidor em memória para isolamento dos testes.

---

### Objetivos

Durante o estudo e execução do código, são abordados os seguintes pontos:

1. Conceitos de testes unitários;
2. Configuração e uso do Jest - instalação, execução e principais funcionalidades;
3. Matchers e modificadores – uso de métodos de asserção do Jest para validar resultados esperados.
4. Agrupamento de testes (`describe`) – organização dos testes em blocos lógicos para melhor legibilidade e manutenção;
5. Hooks de ciclo de vida do teste (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`) – preparação e limpeza de recursos antes, durante e após os testes;
6. Teste de funções que realizam requisições HTTP – validação de endpoints utilizando ferramentas de simulação de requisições;
7. Testes de operações CRUD no MongoDB – criação, leitura, atualização e exclusão de dados, garantindo o correto funcionamento da camada de persistência.

---

### Estrutura de Pastas

A estrutura de diretórios foi organizada para separar claramente responsabilidades e facilitar a manutenção do código:

```bash
server/
├── src/
│   ├── controllers/
│   │   ├── CarController.ts
│   │   └── OperacaoController.ts
│   ├── models/
│   ├── routes/
│   └── index.ts
├── test/
│   ├── controllers/
│   │   └── Car.test.ts
│   └── Operacao.test.ts
├── .env
├── package-lock.json
├── package.json
└── tsconfig.json
```

---

### Como executar o projeto

1. Clonando o repositório e instalando as dependências:
```bash
git clone https://github.com/arleysouza/testes-unitarios.git server
cd server
npm i
```


2. Configuração opcional para execução com MongoDB real

Caso queira executar a API com um banco persistente:
- Crie um banco MongoDB local ou utilize uma instância remota.


3. Executando o servidor em modo de desenvolvimento:
```bash
npm run dev
```


4. Executando os testes
O projeto utiliza o `mongodb-memory-server`, não sendo necessário instalar o MongoDB para rodar os testes.
```bash 
npm test
```
Durante a execução, um servidor MongoDB em memória é iniciado, permitindo que todos os testes rodem de forma isolada, rápida e independente de ambiente externo.

---

### Observações

- O uso do banco de dados em memória garante que os testes sejam rápidos, reprodutíveis e independentes do ambiente local.
- A separação clara entre camadas (controllers, models e rotas) facilita a manutenção e a escrita de novos testes.
- Todos os exemplos de testes foram escritos com fins educacionais, e podem servir como base para implementação em projetos reais.
