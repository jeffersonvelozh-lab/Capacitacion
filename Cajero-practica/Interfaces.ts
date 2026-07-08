import type { Dinero } from "./Dinero";

type TipoTransaccion = 'deposito' | 'retiro';

interface Registro<T>{
    fecha: Date;
    detalle: T; 
}

interface DetalleTransaccion {
    tipo: TipoTransaccion;
    monto: Dinero;
    saldoResultante: Dinero;
}