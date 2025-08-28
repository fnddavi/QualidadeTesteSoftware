import { Request, Response } from "express";
import controlador from "../src/controllers/OperacaoController";

describe("somar", () => {
  test("sum - calcular a soma", async () => {
    // Objeto simulado para representar uma requisição HTTP
    const req = { body: { x: 2, y: 3 } } as Request;
    // Objeto simulado para representar uma resposta HTTP.
    // A propriedade json recebe uma função mockada utilizando o jest.fn().
    // unknown é um tipo mais amplo que aceita qualquer valor, sem fornecer muita informação sobre sua estrutura
    // jest.fn() é usado para espionar a chamada da função json
    const res = { json: jest.fn() } as unknown as Response;
    // Chama o método somar, do OperacaoController, passando os objetos Request e Response simulados
    await controlador.sum(req, res);
    // expectativa (asserção)
    // expect(res.json) é um objeto matcher que permite realizar verificações específicas no método chamado.
    // O método toHaveBeenCalledWith é usado para verificar se o método json foi chamado com argumentos específicos.
    // O papel do expect aqui é realizar a asserção de que, após a execução do método create do carController,
    // o método json do objeto res foi chamado com um objeto contendo a propriedade model com o valor "Uno".
    // Se essa asserção não for verdadeira, o teste falhará, indicando que o comportamento do método create não foi como esperado.
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ r: 5 })
    );
  });

  test("sum - mensagem de parâmetros inválidos", async () => {
    const req = { body: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controlador.sum(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Parâmetros inválidos" })
    );
  });

  test("sum - mensagem de parâmetros não são números", async () => {
    const req = { body: {x: 2, y:"y"} } as Request;
    const res = { json: jest.fn() } as unknown as Response;

    await controlador.sum(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Parâmetros não são números" })
    );
  });
});

describe("potência", () => {
  test("power - calcular a potência", async () => {
    const req = { params: { x: "2", y: "3" } } as unknown as Request;
    // Temos de ajustar a expectativa para verificar o conteúdo enviado pelo método send
    const res = { send: jest.fn() } as unknown as Response;

    await controlador.power(req, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ r: 8 })
    );
  });

  test("power - mensagem de parâmetros inválidos", async () => {
    const req = { params: { x: "a", y: 3 }} as unknown as Request;
    const res = { send: jest.fn() } as unknown as Response;

    await controlador.power(req, res);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Parâmetros não são números" })
    );
  });
});
