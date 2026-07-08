import EventEmitter = require("events");
import type Dinero = require("./Dinero");
import type { Registro, DetalleTransaccion } from "./Interfaces";
import Subject = require("rxjs/internal/Subject");
import types = require("rxjs");

class cuenta extends EventEmitter {
    private saldo!: Dinero.Dinero;
    private historial: Registro<DetalleTransaccion>[] = [];

    // Fñlujs reactivos
    private readonly trasacciones$ = new types.Subject.Subject<DetalleTransaccion>();
}