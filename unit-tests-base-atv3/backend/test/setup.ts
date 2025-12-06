// test/setup.ts
import db from "../src/configs/db";
import fs from "fs";
import path from "path";

// Esta função será executada uma vez antes de toda a suíte de testes
const setup = async () => {
  console.log("Iniciando a preparação do banco de dados de teste...");

  try {
    // Carrega o conteúdo do arquivo SQL
    const sql = fs
      .readFileSync(path.join(__dirname, "../src/configs/comandos.sql"))
      .toString();

    // Executa os comandos para criar as tabelas
    await db.query(sql);

    console.log("Tabelas criadas com sucesso no banco de dados de teste.");
  } catch (error) {
    console.error("Erro ao preparar o banco de dados de teste:", error);
    process.exit(1); // Aborta os testes se o banco não puder ser preparado
  } finally {
    // Fecha a conexão usada para o setup
    await db.end();
  }
};

export default setup;
