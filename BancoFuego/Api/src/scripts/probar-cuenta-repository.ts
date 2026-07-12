// scripts/probar-cuenta-repository.ts
import "dotenv/config";
import { CuentaRepositoryPostgres } from "../Infrastructure/Database/Repositories/CuentaRepositoryPostgres.js";
import { Dinero } from "../Domain/Value-Objects/Dinero.js";

async function main() {
    const repo = new CuentaRepositoryPostgres();

    console.log("--- buscarPorId(1) ---");
    const cuenta = await repo.buscarPorId(1);
    if (!cuenta) {
        console.error("No se encontró la cuenta con id 1. ¿Corriste el seed SQL?");
        process.exit(1);
    }
    console.log("Cuenta encontrada:", {
        id: cuenta.obtenerId(),
        numeroCuenta: cuenta.obtenerNumeroCuenta().toString(),
        saldo: cuenta.obtenerSaldo().toString(),
        activa: cuenta.estaActiva(),
    });

    console.log("--- retirar(50) + actualizar() ---");
    const { saldoAnterior, saldoNuevo } = cuenta.retirar(Dinero.desde(50));
    console.log(`Saldo anterior: ${saldoAnterior.toString()}, saldo nuevo: ${saldoNuevo.toString()}`);

    await repo.actualizar(cuenta);
    console.log("Actualizado en la base.");

    console.log("--- buscarPorId(1) de nuevo, para confirmar persistencia ---");
    const cuentaRecargada = await repo.buscarPorId(1);
    console.log("Saldo tras recargar:", cuentaRecargada?.obtenerSaldo().toString());

    process.exit(0);
}

main().catch((err) => {
    console.error("Error en la prueba:", err);
    process.exit(1);
});