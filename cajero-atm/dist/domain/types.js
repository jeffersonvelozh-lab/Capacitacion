"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoTransaccion = void 0;
// ===== ENUM: conjunto cerrado de valores válidos =====
var TipoTransaccion;
(function (TipoTransaccion) {
    TipoTransaccion["Retiro"] = "RETIRO";
    TipoTransaccion["Deposito"] = "DEPOSITO";
    TipoTransaccion["ConsultaSaldo"] = "CONSULTA_SALDO";
})(TipoTransaccion || (exports.TipoTransaccion = TipoTransaccion = {}));
