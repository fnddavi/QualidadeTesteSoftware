import { Request, Response } from "express";
import personController from "../../src/controllers/PersonController";
import mongoose from "mongoose";
import { Person } from "../../src/models";
import { MongoMemoryServer } from "mongodb-memory-server";

// TGlobal para ser acessado dentro do beforeAll e afterAll
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Criar e inicializar uma instancia do MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  // Obter a URI do servidor de memória
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach( async() => {
  await Person.deleteMany({}); // Limpa a coleção people
});

afterAll(async () => {
  await mongoose.disconnect();
  // Parar o servidor de memória
  await mongoServer.stop();
});

describe("PersonController - create", () => {
  test("criar uma pessoa com sucesso", async () => {
    const req = { body: { name: "Maria" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Maria" })
    );
  });

  test("mensagem de nome obrigatório", async () => {
    const req = { body: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "O nome é obrigatório" })
    );
  });

  test("mensagem de nome ter no máximo 30 caracteres", async () => {
    const req = {
      body: { name: "1234567890123456789012345678901" },
    } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "O nome pode ter no máximo 30 caracteres",
      })
    );
  });

  test("mensagem de nome em uso ao criar pessoa com nome duplicado", async () => {
    await Person.create({ name: "Ana" });

    const req = { body: { name: "Ana" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Este nome já está em uso",
    });
  });
});

describe("PersonController - list", () => {
  test("listar as pessoas com sucesso", async () => {
    await Person.create([{ name: "Pedro" }, { name: "Lucia" }]);

    const req = {} as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.list(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ name: "Lucia" }),
      expect.objectContaining({ name: "Pedro" })
    ]);
  });

  test("retorna um array vazio quando a coleção não possui documentos", async () => {
    const req = {} as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.list(req, res);

    // Verifica se a resposta do método json foi chamada com um array vazio
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("PersonController - delete", () => {
  test("excluir documento com sucesso", async () => {
    const document = await Person.create({ name: "Rafael" });

    const req = { body: { id: document._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.delete(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({
      message: "Registro excluído com sucesso",
    });
  });

  test("mensagem de registro inexistente ao excluir documento que não existe", async () => {
    // Objeto Request com um _id que não existe na coleção
    const req = { body: { id: "65ad9cd937249b0b77a4e343" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.delete(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Registro inexistente" });
  });
});

describe("PersonController - update", () => {
  test("atualiza documento com sucesso", async () => {
    // Adiciona um documento na coleção
    const document = await Person.create({ name: "Manoele" });

    const req = { body: { id: document._id, name: "Manoela" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Manoela" })
    );
  });

  test("mensagem de registro inexistente ao atualizar documento que não existe", async () => {
    // Objeto Request com um _id que não existe na coleção
    const req = { body: { id: "65ad9cd937249b0b77a4e343" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Pessoa inexistente" });
  });

  test("mensagem de nome em uso ao atualizar uma pessoa com nome duplicado", async () => {
    // Adiciona 2 documentos na coleção
    await Person.create({ name: "Luciana" });
    const document = await Person.create({ name: "Lucy" });

    const req = { body: { id: document._id, name: "Luciana" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Este nome já está em uso" });   
  });

  test("mensagem de nome obrigatório ao atualizar pessoa", async () => {
    const document = await Person.create({ name: "Carla" });

    const req = { body: { id: document._id, name: "" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await personController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "O nome é obrigatório",
    });
  });
});
