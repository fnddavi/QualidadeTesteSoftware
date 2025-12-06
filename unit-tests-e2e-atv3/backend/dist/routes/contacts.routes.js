"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const validateBody_1 = require("../middlewares/validateBody");
const router = (0, express_1.Router)();
// Criar novo contato
router.post("/", (0, validateBody_1.validateBody)([
    { name: "name", required: true, type: "string", minLength: 2, maxLength: 50 },
    { name: "phone", required: true, type: "string", pattern: /^(\(\d{2}\)|\d{2})\d{4,5}-?\d{4}$/ }
]), contact_controller_1.createContact);
// Listar todos os contatos do usuário logado
router.get("/", contact_controller_1.getContacts);
// Atualizar contato
router.put("/:id", (0, validateBody_1.validateBody)([
    { name: "name", required: true, type: "string", minLength: 2, maxLength: 50 },
    { name: "phone", required: true, type: "string", pattern: /^(\(\d{2}\)|\d{2})\d{4,5}-?\d{4}$/ }
]), contact_controller_1.updateContact);
// Deletar contato
router.delete("/:id", contact_controller_1.deleteContact);
exports.default = router;
