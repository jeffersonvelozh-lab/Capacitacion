import type Dinero = require("./Interfaces");


type TipoTransaccion = 'deposito' | 'retiro';

export type ResultadoOperacion =
    | { tipo: "exito"; mensaje: string; saldoActual: Dinero.Dinero }
    | { tipo: "error"; mensaje: string };