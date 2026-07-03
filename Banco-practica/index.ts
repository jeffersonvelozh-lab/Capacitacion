// ===== PRIMITIVOS =====
type NumeroCuenta = string;
type Pin = string;      

// ENUM: conjunto cerrado de opciones válidas
enum TipoTransaccion {
  Retiro = "RETIRO",
  Deposito = "DEPOSITO",
  ConsultaSaldo = "CONSULTA_SALDO",
}

// COMPUESTO: la entidad Cuenta
interface Cuenta {
  readonly numeroCuenta: NumeroCuenta;
  saldo: Dinero;
  readonly pin: Pin;
  activa: boolean;
}

//COMPUESTO: registro de una transacción
interface Transaccion {
  readonly id: string;
  readonly tipo: TipoTransaccion;
  readonly monto: Dinero;
  readonly fecha: Date;
  readonly numeroCuenta: NumeroCuenta;
}

// ===== VALUE OBJECT: un compuesto INMUTABLE que protege una regla =====
// Object.freeze() es clave aquí: evita que alguien con una referencia
// a este objeto lo modifique "por atrás" en el Heap.
class Dinero {
  private readonly _monto: number;

  constructor(monto: number) {
    if (monto < 0) {
      throw new Error("El monto no puede ser negativo");
    }
    if (!Number.isFinite(monto)) {
      throw new Error("Monto inválido");
    }
    this._monto = Math.round(monto * 100) / 100;
    Object.freeze(this);
  }

  get valor(): number {
    return this._monto;
  }

  sumar(otro: Dinero): Dinero {
    return new Dinero(this._monto + otro._monto); // devuelve un objeto NUEVO
  }

  restar(otro: Dinero): Dinero {
    return new Dinero(this._monto - otro._monto);
  }

  esMayorQue(otro: Dinero): boolean {
    return this._monto > otro._monto;
  }
}

