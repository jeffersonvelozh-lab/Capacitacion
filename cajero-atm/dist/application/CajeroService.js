"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajeroService = void 0;
const generarId_1 = require("../domain/generarId");
const Dinero_1 = require("../domain/Dinero");
const types_1 = require("../domain/types");
const LIMITE_DEPOSITO = new Dinero_1.Dinero(10000);
class CajeroService {
    retirar(cuenta, montoSolicitado, pinIngresado) {
        if (pinIngresado !== cuenta.pin) {
            return { exito: false, error: "PIN_INCORRECTO" };
        }
        if (!cuenta.activa) {
            return { exito: false, error: "CUENTA_INACTIVA" };
        }
        const monto = new Dinero_1.Dinero(montoSolicitado);
        if (monto.esMayorQue(cuenta.saldo)) {
            return { exito: false, error: "SALDO_INSUFICIENTE" };
        }
        // Reemplazamos el saldo por un Dinero NUEVO (no lo mutamos por dentro)
        cuenta.saldo = cuenta.saldo.restar(monto);
        const transaccion = {
            id: (0, generarId_1.generarId)(),
            tipo: types_1.TipoTransaccion.Retiro,
            monto,
            fecha: new Date(),
            numeroCuenta: cuenta.numeroCuenta,
        };
        return { exito: true, nuevoSaldo: cuenta.saldo, transaccion };
    }
    depositar(cuenta, montoSolicitado) {
        if (!cuenta.activa) {
            return { exito: false, error: "CUENTA_INACTIVA" };
        }
        if (montoSolicitado <= 0) {
            return { exito: false, error: "MONTO_INVALIDO" };
        }
        const monto = new Dinero_1.Dinero(montoSolicitado);
        if (monto.esMayorQue(LIMITE_DEPOSITO)) {
            return { exito: false, error: "LIMITE_EXCEDIDO" };
        }
        cuenta.saldo = cuenta.saldo.sumar(monto);
        const transaccion = {
            id: (0, generarId_1.generarId)(),
            tipo: types_1.TipoTransaccion.Deposito,
            monto,
            fecha: new Date(),
            numeroCuenta: cuenta.numeroCuenta,
        };
        return { exito: true, nuevoSaldo: cuenta.saldo, transaccion };
    }
    consultarSaldo(cuenta) {
        if (!cuenta.activa) {
            return { exito: false, error: "CUENTA_INACTIVA" };
        }
        return { exito: true, saldo: cuenta.saldo };
    }
}
exports.CajeroService = CajeroService;
