import { Request, Response } from "express";
import controller from "../../src/controllers/CarByPersonController";
import mongoose from "mongoose";
import { Person, Car, CarByPerson } from "../../src/models";
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
  await CarByPerson.deleteMany({}); // Limpa a coleção car_by_persons
  await Person.deleteMany({}); // Limpa a coleção people
  await Car.deleteMany({}); // Limpa a coleção cars
});

afterAll(async () => {
  await mongoose.disconnect();
  // Parar o servidor de memória
  await mongoServer.stop();
});

describe("CarByPersonController - create", () => {
  test("criar um documento com sucesso", async () => {
    // Cria uma pessoa
    const person = await Person.create({ name: "Carla" });
    // Cria um carro
    const car = await Car.create({ model: "Gol" });
    const req = { body: { car: car._id, person: person._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ car: car._id, person: person._id })
    );
  });

  test("mensagem de pessoa não existe", async () => {
    // Cria um carro
    const car = await Car.create({ model: "Uno" });
    const req = { body: { car: car._id, person: "65c166032bf7ec0555fb2fba" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "A pessoa fornecida não existe"
    });
  });

  test("mensagem de carro não existe", async () => {
    // Cria uma pessoa
    const person = await Person.create({ name: "José" });
    const req = { body: { car: "65c166032bf7ec0555fb2fba", person: person._id  } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "O carro fornecido não existe"
    });
  });

  test("mensagem de carro é obrigatório", async () => {
    // Cria uma pessoa
    const person = await Person.create({ name: "Lucy" });
    const req = { body: { person: person._id} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "O carro é obrigatório"
    });
  });

  test("mensagem de pessoa é obrigatória", async () => {
    // Cria um carro
    const car = await Car.create({ model: "Corsa" });
    const req = { body: { car: car._id} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "A pessoa é obrigatória"
    });
  });

});

describe("CarByPersonController - list", () => {
  test("listar os documentos com sucesso", async () => {
    // Adiciona um documento na people
    const person = await Person.create({ name: "Pedro" });
    // Adiciona 2 documentos na cars
    const corsa = await Car.create({ model: "Corsa" });
    const uno = await Car.create({ model: "Uno" });
    // Adiciona 1 documento na car_by_persons
    const um = await CarByPerson.create({ person: person._id, car: corsa._id });
    const dois = await CarByPerson.create({ person: person._id, car: uno._id });
    const req = { body: { person: person._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.list(req, res);

    /*
    // Versão de teste mais genérico
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ _id: um._id, car: expect.any(Car) }),
      expect.objectContaining({ _id: dois._id, car: expect.any(Car) }),
    ]);*/
    // Versão de teste mais específico. É necessário acertar a ordem dos elementos no array
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ _id: um._id, car: expect.objectContaining({model:"Corsa"}) }),
      expect.objectContaining({ _id: dois._id, car: expect.objectContaining({model:"Uno"}) })
    ]);
  });

  test("retorna um array vazio quando a coleção não possui documentos", async () => {
    // Adiciona um documento na people
    const person = await Person.create({ name: "Pedro" });

    const req = { body: { person: person._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.list(req, res);

    // Verifica se a resposta do método json foi chamada com um array vazio
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("retorna um array vazio quando não fornece a pessoa", async () => {
    const req = { body: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.list(req, res);

    // Verifica se a resposta do método json foi chamada com um array vazio
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("CarByPersonController - delete", () => {
  test("excluir documento com sucesso", async () => {
    // Adiciona um documento na people
    const person = await Person.create({ name: "Pedro" });
    // Adiciona 1 documento na cars
    const corsa = await Car.create({ model: "Corsa" });

    // Adiciona 1 documento na car_by_persons
    const document = await CarByPerson.create({ person: person._id, car: corsa._id });

    const req = { body: { id: document._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.delete(req, res);

    expect(res.json).toHaveBeenCalledWith({message: "Registro excluído com sucesso"});
  });

  test("mensagem de registro inexistente ao excluir documento que não existe", async () => {
    // Objeto Request com um _id que não existe na coleção
    const req = { body: { id: "65ad9cd937249b0b77a4e343" } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.delete(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Registro inexistente" });
  });
});

describe("CarByPersonController - update", () => {
  test("atualiza documento com sucesso", async () => {
    // Adiciona um documento na people
    const person = await Person.create({ name: "Pedro" });
    // Adiciona 2 documentos na cars
    const corsa = await Car.create({ model: "Corsa" });
    const uno = await Car.create({ model: "Uno" });
    // Adiciona 1 documento na car_by_persons
    const document = await CarByPerson.create({ person: person._id, car: corsa._id });
    const req = { body: { id: document._id, person: person._id, car: uno._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ _id: document._id, car: uno._id, person: person._id })
    );
  });

  test("mensagem de registro inexistente", async () => {
    // Adiciona um documento na people
    const person = await Person.create({ name: "Pedro" });
    // Adiciona 1 documento na cars
    const corsa = await Car.create({ model: "Corsa" });
    // Adiciona 1 documento na car_by_persons
    const req = { body: { id: "65ad9cd937249b0b77a4e343", person: person._id, car: corsa._id } } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controller.update(req, res);

    // Verifica se a resposta do método json foi chamada com a mensagem esperada
    expect(res.json).toHaveBeenCalledWith({ message: "Registro inexistente" });
  });
});