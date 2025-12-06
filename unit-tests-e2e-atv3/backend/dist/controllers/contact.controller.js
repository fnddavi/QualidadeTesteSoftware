"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContact = exports.getContacts = exports.createContact = void 0;
const db_1 = __importDefault(require("../configs/db"));
// --- Criar novo contato ---
const createContact = async (req, res) => {
    try {
        const user = req.user;
        const { name, phone } = req.body;
        const result = await db_1.default.query("INSERT INTO contacts (user_id, name, phone) VALUES ($1, $2, $3) RETURNING *", [user.id, name, phone]);
        res.status(201).json({
            success: true,
            data: { contact: result.rows[0] },
        });
    }
    catch (error) {
        console.error("Erro ao criar contato:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
};
exports.createContact = createContact;
// --- Listar todos os contatos do usuário logado ---
const getContacts = async (req, res) => {
    try {
        const user = req.user;
        const result = await db_1.default.query("SELECT * FROM contacts WHERE user_id = $1", [user.id]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Erro ao buscar contatos:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
};
exports.getContacts = getContacts;
// --- Atualizar contato ---
const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;
        const user = req.user;
        const result = await db_1.default.query("UPDATE contacts SET name = $1, phone = $2 WHERE id = $3 AND user_id = $4 RETURNING *", [name, phone, id, user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Contato não encontrado" });
            return;
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error("Erro ao atualizar contato:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
};
exports.updateContact = updateContact;
// --- Deletar contato ---
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const result = await db_1.default.query("DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *", [id, user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Contato não encontrado" });
            return;
        }
        res.json({ success: true, data: { message: "Contato deletado com sucesso" } });
    }
    catch (error) {
        console.error("Erro ao deletar contato:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
};
exports.deleteContact = deleteContact;
