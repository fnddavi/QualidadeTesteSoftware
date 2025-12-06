"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
// Niddleware global de tratamento de erros
function errorHandler(err, _req, res, _next) {
    console.error("Erro capturado pelo middleware:", err);
    res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        // Em ambiente de desenvolvimento, incluímos detalhes do erro
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
    });
}
