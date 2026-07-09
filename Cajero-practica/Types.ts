import type Dinero = require("./Interfaces");


export type TipoTransaccion = 'deposito' | 'retiro';

export type ResultadoOperacion =
    | { tipo: "exito"; mensaje: string; saldoActual: Dinero.Dinero }
    | { tipo: "error"; mensaje: string };