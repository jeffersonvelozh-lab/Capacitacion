/**
 * VALUE OBJECT
 * En vez de manejar el saldo como un "number" suelto, lo envolvemos
 * en esta clase para que:
 *  1) Nunca pueda existir un monto inválido (negativo, NaN, etc.)
 *  2) Nunca cambie una vez creado (inmutable) -> cada operación
 *     devuelve un objeto NUEVO en vez de mutar el existente.
 *
 * Esto es lo que evita bugs de "memoria compartida": como Dinero nunca
 * cambia por dentro, compartir su referencia entre dos objetos es seguro.
 */
export class Dinero {
  private readonly _monto: number;

  constructor(monto: number) {
    if (monto < 0) {
      throw new Error("El monto no puede ser negativo");
    }
    if (!Number.isFinite(monto)) {
      throw new Error("Monto inválido");
    }
    // Redondeo a 2 decimales para evitar errores de punto flotante (0.1 + 0.2 !== 0.3)
    this._monto = Math.round(monto * 100) / 100;
    Object.freeze(this);
  }

  get valor(): number {
    return this._monto;
  }

  sumar(otro: Dinero): Dinero {
    return new Dinero(this._monto + otro._monto);
  }

  restar(otro: Dinero): Dinero {
    return new Dinero(this._monto - otro._monto);
  }

  esMayorQue(otro: Dinero): boolean {
    return this._monto > otro._monto;
  }

  toString(): string {
    return `$${this._monto.toFixed(2)}`;
  }
}
