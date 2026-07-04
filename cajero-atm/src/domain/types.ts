import { Dinero } from "./Dinero";

// ===== TIPOS PRIMITIVOS "SEMÁNTICOS" =====
// Aunque por debajo son string, los usamos como alias para dejar claro
// que NO son cantidades con las que se hacen operaciones matemáticas.
export type NumeroCuenta = string;
export type Pin = string;

// ===== ENUM: conjunto cerrado de valores válidos =====
export enum TipoTransaccion {
  Retiro = "RETIRO",
  Deposito = "DEPOSITO",
  ConsultaSaldo = "CONSULTA_SALDO",
}

// ===== TIPOS COMPUESTOS (entidades) =====
export interface Cuenta {
  readonly numeroCuenta: NumeroCuenta;
  saldo: Dinero;
  readonly pin: Pin;
  activa: boolean;
}

export interface Transaccion {
  readonly id: string;
  readonly tipo: TipoTransaccion;
  readonly monto: Dinero;
  readonly fecha: Date;
  readonly numeroCuenta: NumeroCuenta;
}

// ===== DISCRIMINATED UNIONS: resultados de cada operación =====
// El compilador obliga a comprobar "exito" antes de acceder a los datos.
export type ResultadoRetiro =
  | { exito: true; nuevoSaldo: Dinero; transaccion: Transaccion }
  | { exito: false; error: "PIN_INCORRECTO" | "CUENTA_INACTIVA" | "SALDO_INSUFICIENTE" };

export type ResultadoDeposito =
  | { exito: true; nuevoSaldo: Dinero; transaccion: Transaccion }
  | { exito: false; error: "MONTO_INVALIDO" | "LIMITE_EXCEDIDO" | "CUENTA_INACTIVA" };

export type ResultadoConsulta =
  | { exito: true; saldo: Dinero }
  | { exito: false; error: "CUENTA_INACTIVA" };
