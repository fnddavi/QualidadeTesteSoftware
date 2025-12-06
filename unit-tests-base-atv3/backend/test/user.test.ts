// tests/user.test.ts
import request from "supertest";
import express from "express";
import router from "../src/routes";
import db from "../src/configs/db";
import redisClient from "../src/configs/redis";

// Carrega a aplicação Express para os testes
const app = express();
app.use(express.json());
app.use("/", router);

// Variáveis globais para armazenar dados entre os testes
let authToken = "";
const testUser = {
  username: "testuser",
  password: "password123",
};

// Limpa o banco de dados e o Redis antes de todos os testes
beforeAll(async () => {
  await db.query("DELETE FROM contacts");
  await db.query("DELETE FROM users");
  await redisClient.flushall();
});

// Fecha as conexões após todos os testes
afterAll(async () => {
  await db.end();
  await redisClient.quit();
});

describe("User Authentication", () => {
  // --- Testes de Registro ---
  describe("POST /users (Registro)", () => {
    it("deve criar um usuário válido com sucesso", async () => {
      const response = await request(app).post("/users").send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Usuário criado com sucesso.");
    });

    it("deve impedir a criação de usuário com nome de usuário muito curto", async () => {
      const response = await request(app)
        .post("/users")
        .send({ username: "us", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toContain(
        "Campo username deve ter no mínimo 3 caracteres"
      );
    });

    it("deve impedir a criação de usuário com senha menor que 6 caracteres", async () => {
      const response = await request(app)
        .post("/users")
        .send({ username: "newuser", password: "123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toContain(
        "Campo password deve ter no mínimo 6 caracteres"
      );
    });

    it("deve impedir a criação de um usuário duplicado", async () => {
      const response = await request(app).post("/users").send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("já está cadastrado"); // <--- Correção
    });
  });

  // --- Testes de Login ---
  describe("POST /users/login (Login)", () => {
    it("deve permitir login com credenciais válidas e retornar um token JWT", async () => {
      const response = await request(app).post("/users/login").send(testUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(testUser.username);

      // Salva o token para usar em testes autenticados
      authToken = response.body.data.token;
    });

    it("deve bloquear login com senha incorreta", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: testUser.username, password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Credenciais inválidas.");
    });

    it("deve bloquear login com usuário inexistente", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: "nonexistentuser", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Credenciais inválidas.");
    });

    it("deve bloquear login com campo de senha ausente (validateBody)", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: testUser.username });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toContain("Campo obrigatório: password");
    });
  });

  // --- Testes de Logout ---
  describe("POST /users/logout (Logout)", () => {
    it("deve permitir logout de um usuário autenticado e invalidar o token", async () => {
      const response = await request(app)
        .post("/users/logout")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe(
        "Logout realizado com sucesso. Token invalidado."
      );
    });

    it("deve rejeitar uma requisição com um token que já foi deslogado", async () => {
      // Esta rota de contatos requer autenticação, ideal para testar o token invalidado
      const response = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Token expirado ou inválido");
    });
  });
});
