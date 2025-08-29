// tests/contact.test.ts
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
let contactId: number;

const testUser = {
  username: "contactuser",
  password: "password123",
};

// Limpa o banco e cria um usuário para os testes de contato
beforeAll(async () => {
  await db.query("DELETE FROM contacts");
  await db.query("DELETE FROM users WHERE username = $1", [testUser.username]);

  // Registrar usuário
  await request(app).post("/users").send(testUser);

  // Fazer login e obter token
  const loginResponse = await request(app).post("/users/login").send(testUser);
  authToken = loginResponse.body.data.token;
});

// Fecha as conexões após todos os testes
afterAll(async () => {
  await db.end();
  await redisClient.quit();
});

describe("Contacts CRUD", () => {
  // --- Testes de Criação de Contato ---
  describe("POST /contacts (Criação)", () => {
    it("deve criar um contato válido com sucesso", async () => {
      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "João Silva", phone: "12999998888" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.name).toBe("João Silva");

      // Salva o ID do contato para usar em outros testes
      contactId = response.body.data.contact.id;
    });

    it("deve impedir a criação de contato sem o campo nome", async () => {
      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ phone: "12999998888" });

      expect(response.status).toBe(400);
      expect(response.body.data).toContain("Campo obrigatório: name");
    });

    it("deve impedir a criação de contato com nome muito curto", async () => {
      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "A", phone: "12999998888" });

      expect(response.status).toBe(400);
      expect(response.body.data).toContain(
        "Campo name deve ter no mínimo 2 caracteres"
      );
    });

    it("deve impedir a criação de contato com telefone em formato inválido", async () => {
      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Maria", phone: "12345" });

      expect(response.status).toBe(400);
      expect(response.body.data).toContain(
        "Campo phone não corresponde ao formato esperado"
      );
    });
  });

  // --- Testes de Listagem de Contatos ---
  describe("GET /contacts (Listagem)", () => {
    it("deve listar somente os contatos do usuário autenticado", async () => {
      const response = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1); // Espera encontrar apenas o contato criado
      expect(response.body.data[0].name).toBe("João Silva");
    });
  });

  // --- Testes de Atualização de Contato ---
  describe("PUT /contacts/:id (Atualização)", () => {
    it("deve atualizar um contato existente com sucesso", async () => {
      const updatedContact = {
        name: "João da Silva Sauro",
        phone: "12988776655",
      };
      const response = await request(app)
        .put(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedContact);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatedContact.name);
      expect(response.body.data.phone).toBe(updatedContact.phone);
    });

    it("deve retornar erro 404 ao tentar atualizar um contato inexistente", async () => {
      const response = await request(app)
        .put("/contacts/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Inexistente", phone: "12900000000" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Contato não encontrado");
    });
  });

  // --- Testes de Exclusão de Contato ---
  describe("DELETE /contacts/:id (Exclusão)", () => {
    it("deve deletar um contato existente com sucesso", async () => {
      const response = await request(app)
        .delete(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Contato deletado com sucesso");
    });

    it("deve retornar erro 404 ao tentar deletar um contato inexistente", async () => {
      const response = await request(app)
        .delete("/contacts/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Contato não encontrado");
    });
  });
});
