"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioCuentas = void 0;
/**
 * Simula el "Heap persistente" del sistema: un solo lugar donde viven
 * los objetos reales. En un proyecto real, esto sería tu capa
 * Infrastructure con Entity Framework Core y SQL Server.
 */
class RepositorioCuentas {
    constructor() {
        this.cuentas = new Map();
    }
    guardar(cuenta) {
        this.cuentas.set(cuenta.numeroCuenta, cuenta);
    }
    buscarPorNumero(numeroCuenta) {
        // OJO: esto devuelve la REFERENCIA real, no una copia.
        return this.cuentas.get(numeroCuenta);
    }
    /**
     * Crea una copia INDEPENDIENTE de la cuenta (nuevo objeto en el Heap).
     * Útil cuando quieres "previsualizar" algo sin arriesgar el estado real.
     */
    copiarCuenta(cuenta) {
        return {
            numeroCuenta: cuenta.numeroCuenta,
            saldo: cuenta.saldo, // Dinero es inmutable: compartir su referencia es seguro
            pin: cuenta.pin,
            activa: cuenta.activa,
        };
    }
}
exports.RepositorioCuentas = RepositorioCuentas;
