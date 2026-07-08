import EventEmitter = require("events");
import type { Registro, DetalleTransaccion, Dinero } from "./Interfaces";
import Subject = require("rxjs/internal/Subject");
import types = require("rxjs");
import type { ResultadoOperacion } from "./Types";

class cuenta extends EventEmitter {
    private saldo!: Dinero;
    private historial: Registro<DetalleTransaccion>[] = [];

    // Fñlujs reactivos
    private readonly trasacciones$ = new types.Subject<DetalleTransaccion>();

    constructor(public readonly titular: string, saldoInicial: Dinero) {
        super();
        this.saldo = saldoInicial;
        this.emit("SaldoActualizado", this.saldo);
    };

    registrarMovimiento(tipo: "deposito" | "retiro", monto: Dinero): void {
        const detalle: DetalleTransaccion = { tipo, monto, saldoResultante: this.saldo };
        this.historial.push({ fecha: new Date(), detalle });

        this.trasacciones$.next(detalle);
        this.emit("transacción", detalle);
    };

    depositar(monto: Dinero): ResultadoOperacion {
        if (monto.monto <= 0) {
            return { tipo: "error", mensaje: "El monto a depositar debe ser mayor a 0." };
        }   
    }

}