
type TipoTransaccion = 'deposito' | 'retiro';

export interface Registro<T>{
    fecha: Date;
    detalle: T; 
}

export interface DetalleTransaccion {
    tipo: TipoTransaccion;
    monto: Dinero;
    saldoResultante: Dinero;
}

export interface Dinero  {
    readonly monto: number;
}