"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_routes_1 = __importDefault(require("./users.routes"));
const contacts_routes_1 = __importDefault(require("./contacts.routes"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use("/users", users_routes_1.default);
router.use("/contacts", authMiddleware_1.authMiddleware, contacts_routes_1.default);
exports.default = router;
