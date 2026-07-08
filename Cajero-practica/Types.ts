import type Dinero = require("./Dinero");


type TipoTransaccion = 'deposito' | 'retiro';

type ResultadoOperacion =
    | { tipo: "exito"; mensaje: string; saldoActual: Dinero.Dinero }
    | { tipo: "error"; mensaje: string };