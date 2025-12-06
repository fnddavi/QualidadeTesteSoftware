cd/app


docker compose -f docker-compose.test.yml up -d
docker compose -f docker-compose.test.yml ps

docker compose up -d (sugestão arley)

npm install
npm i -D ts-node-dev cross-env

npm run redis:dev
npm run dev

npm test

Iniciando o servidor
```
npm start
npm run dev
```

---

### ▶️ Testando a API com REST Client

O arquivo `/http/requests.http` contém as requisições da aplicação (login, registro, logout, CRUD de contatos).
Para executá-las diretamente no VSCode, instale a extensão:

👉 REST Client (autor: Huachao Mao)

Após instalar, basta abrir o arquivo `requests.http`, clicar em `Send Request` sobre a requisição desejada, e o VSCode mostrará a resposta no editor.

---

### 🔑 Endpoints

**Registro de usuário**
``` bash
POST /users
```

**Login**
``` bash
POST /users/login
```
Resposta (exemplo):
```bash
{ "token": "eyJhbG..." }
```

**Logout**
``` bash
POST /users/logout
```
Invalida o token atual adicionando-o à blacklist no Redis.

**Rotas protegidas**

**Listar, criar, atualizar e adicionar contatos**
``` bash
GET /contacts
POST /contacts
PUT /contacts
DELETE /contacts/:id
```

---

### 📌 Por que usar blacklist de tokens no logout?

Os JWTs são imutáveis: uma vez emitidos, não podem ser revogados no servidor até que expirem.
Isso gera um problema: mesmo que o usuário faça logout, o token ainda seria válido até seu tempo de expiração.
Para resolver isso, utilizamos uma blacklist de tokens armazenada no Redis:
- No logout (`logoutUser` em `user.controller.ts`), o token é decodificado e adicionado ao Redis até o tempo de expiração (`exp`) definido no JWT;
- O token é armazenado de forma segura: apenas seu hash SHA-256 é gravado, evitando expor o JWT completo;
- No middleware de autenticação (`authMiddleware.ts`), antes de validar o token com `verifyToken` (`jwt.ts`), verificamos se o hash do token está na blacklist;
- Se estiver, a requisição é bloqueada imediatamente.
Assim, garantimos que tokens "descartados" não possam ser reutilizados, mesmo que ainda não tenham expirado.

---

### 📌 Tipagem customizada

1. Para o Express (`src/types/express/index.d.ts`)
- Estende a interface `Request` do Express para incluir a propriedade `req.user`, adicionada pelo middleware de autenticação.
- Permite que o TypeScript forneça autocompletar e checagem de tipos ao acessar `req.user` dentro das rotas.


2. Para variáveis globais (`src/types/global.d.ts`)
- Declara os objetos `global.pool` (PostgreSQL) e `global.redis` (Redis) usados nos testes.
- Evita que o TypeScript acuse erro de tipo quando usamos `global.pool.query(...)` ou `global.redis.ping()`.
- Garante que essas variáveis tenham tipagem forte, em vez de `any`.


***Observação sobre o `tsconfig.json`:**
Certifique-se de que a pasta `src/types` esteja incluída no `include` do `tsconfig.json`, por exemplo:
```json
{
  "compilerOptions": {
    ...
  },
  "include": ["src/**/*.ts", "src/types/**/*.d.ts"]
}
```

---

### 📌 Observações

- A função `verifyToken` (`src/utils/jwt.ts`) pode ser configurada para retornar o payload mesmo se o token estiver expirado - isso é útil no processo de logout.
- O Redis é utilizado apenas como armazenamento de tokens inválidos (blacklist).
- Em produção, recomenda-se configurar tempo de expiração para as chaves da blacklist no Redis (TTL).