import { Cuenta, NumeroCuenta } from "../domain/types";

/**
 * Simula el "Heap persistente" del sistema: un solo lugar donde viven
 * los objetos reales. En un proyecto real, esto sería tu capa
 * Infrastructure con Entity Framework Core y SQL Server.
 */
export class RepositorioCuentas {
  private cuentas: Map<NumeroCuenta, Cuenta> = new Map();

  guardar(cuenta: Cuenta): void {
    this.cuentas.set(cuenta.numeroCuenta, cuenta);
  }

  buscarPorNumero(numeroCuenta: NumeroCuenta): Cuenta | undefined {
    // OJO: esto devuelve la REFERENCIA real, no una copia.
    return this.cuentas.get(numeroCuenta);
  }

  /**
   * Crea una copia INDEPENDIENTE de la cuenta (nuevo objeto en el Heap).
   * Útil cuando quieres "previsualizar" algo sin arriesgar el estado real.
   */
  copiarCuenta(cuenta: Cuenta): Cuenta {
    return {
      numeroCuenta: cuenta.numeroCuenta,
      saldo: cuenta.saldo, // Dinero es inmutable: compartir su referencia es seguro
      pin: cuenta.pin,
      activa: cuenta.activa,
    };
  }
}
