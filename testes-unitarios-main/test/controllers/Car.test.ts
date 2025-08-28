import { Request, Response } from "express";
import carController from "../../src/controllers/CarController";
import mongoose from "mongoose";
import { Car } from "../../src/models";
import { MongoMemoryServer } from "mongodb-memory-server";

// Global para ser acessado dentro do beforeAll e afterAll
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Criar e inicializar uma instancia do MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  // Obter a URI do servidor de memória
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach( async() => {
  await Car.deleteMany({}); // Limpa a coleção cars
});

afterAll(async () => {
  await mongoose.disconnect();
  // Parar o servidor de memória
  await mongoServer.stop();
});

describe("CarController - create", () => {
  test("criar um carro com sucesso", async () => {
    // Fornece a propriedade model para criar um carro 
    const req = { body: { model: "Uno" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ model: "Uno" })
    );
  });

  test("mensagem de modelo obrigatório", async () => {
    // Não está sendo fornecido o parâmetro model
    const req = { body: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "O modelo é obrigatório" })
    );
  });

  test("mensagem de modelo ter no máximo 15 caracteres", async () => {
    const req = { body: { model: "1234567890123456" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "O modelo pode ter no máximo 15 caracteres",
      })
    );
  });

  test("mensagem de modelo em uso ao carro com modelo duplicado", async () => {
    // Adiciona um documento na coleção para simular um modelo duplicado.
    // Car é um modelo do Mongoose. A partir do modelo é criado um documento e inserido na coleção do BD
    await Car.create({ model: "Pampa" });

    const req = { body: { model: "Pampa" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Este modelo já está em uso",
    });
  });
});

describe("CarController - list", () => {

  test("listar os carros com sucesso", async () => {
    // Adiciona 3 documentos na coleção
    await Car.create([
      { model: "Fusca" },
      { model: "Corcel" },
      { model: "Opala" },
    ]);

    const req = {} as Request;
    const res = { json: jest.fn() } as unknown as Response;
    // Chama o método list do carController
    await carController.list(req, res);

    // Verifica se a resposta do método json foi chamada com os objetos esperados, incluindo a ordem
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ model: "Corcel" }),
      expect.objectContaining({ model: "Fusca" }),
      expect.objectContaining({ model: "Opala" }),
    ]);
  });

  test("retorna um array vazio quando a coleção não possui documentos", async () => {
    const req = {} as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.list(req, res);

    // Verifica se a resposta do método json foi chamada com um array vazio
    expect(res.json).toHaveBeenCalledWith([]);
  });
});


describe("CarController - delete", () => {
  test("excluir documento com sucesso", async () => {
    // Adiciona um documento na coleção
    const document = await Car.create({ model: "Gol" });

    const req = { body: { id: document._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.delete(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({
      message: "Registro excluído com sucesso",
    });
  });

  test("mensagem de registro inexistente ao excluir documento que não existe", async () => {
    // Objeto Request com um _id que não existe na coleção
    const req = { body: { id: "65ad9cd937249b0b77a4e343" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.delete(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Registro inexistente" });
  });
});


describe("CarController - update", () => {
  test("atualiza documento com sucesso", async () => {
    // Adiciona um documento na coleção
    const document = await Car.create({ model: "Gol" });

    const req = { body: { id: document._id, model: "Polo" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ model: "Polo" })
    );
  });

  test("mensagem de registro inexistente ao atualizar documento que não existe", async () => {
    // Objeto Request com um _id que não existe na coleção
    const req = { body: { id: "65ad9cd937249b0b77a4e343" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Carro inexistente" });
  });

  test("mensagem de modelo em uso ao atualizar um carro com modelo duplicado", async () => {
    // Adiciona 2 documentos na coleção
    await Car.create({ model: "Saveiro" });
    const document = await Car.create({ model: "D20" });

    const req = { body: { id: document._id, model: "Saveiro" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Este modelo já está em uso",
    });
  });

  test("mensagem de modelo obrigatório ao atualizar carro", async () => {
    const document = await Car.create({ model: "C10" });

    const req = { body: { id: document._id, model:"" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await carController.update(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "O modelo é obrigatório",
    });
  });
});