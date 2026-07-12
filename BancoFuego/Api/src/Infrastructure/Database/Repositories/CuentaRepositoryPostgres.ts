// Infrastructure/Database/Repositories/CuentaRepositoryPostgres.ts
import { ICuentaRepository } from "../../../Application/Ports/ICuentaRepository";
import { Cuenta } from "../../../Domain/Entities/Cuenta";
import { Dinero } from "../../../Domain/Value-Objects/Dinero";
import { NumeroCuenta } from "../../../Domain/Value-Objects/NumeroCuenta";
import { TipoCuenta } from "../../../Domain/Enums/TiposDominio";
import { PostgresConnection } from "../PostgresConnection";

interface FilaCuenta {
    id_cuenta: number;
    numero_cuenta: string;
    tipo: TipoCuenta;
    saldo: string;       // NUMERIC llega como string
    fecha_creacion: Date;
    activa: boolean;
    id_cliente: number;
    id_banco: number;
}

export class CuentaRepositoryPostgres implements ICuentaRepository {
    private readonly pool = PostgresConnection.obtenerPool();

    async buscarPorId(id: number): Promise<Cuenta | null> {
        const resultado = await this.pool.query<FilaCuenta>(
            `SELECT id_cuenta, numero_cuenta, tipo, saldo, fecha_creacion, activa, id_cliente, id_banco
                FROM BancoFuego.Cuenta
                WHERE id_cuenta = $1`,
            [id],
        );
        if (resultado.rowCount === 0) return null;
        return this.aEntidad(resultado.rows[0]!);
    }

    async crear(cuenta: Cuenta): Promise<number> {
        const resultado = await this.pool.query<{ id_cuenta: number }>(
            `INSERT INTO BancoFuego.Cuenta
                (numero_cuenta, tipo, saldo, id_cliente, id_banco)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id_cuenta`,
            [
                cuenta.obtenerNumeroCuenta().toString(),
                this.obtenerTipo(cuenta),
                cuenta.obtenerSaldo().toNumber(),
                cuenta.obtenerIdCliente(),
                this.obtenerIdBanco(cuenta),
            ],
        );
        return resultado.rows[0]!.id_cuenta;
    }

    async actualizar(cuenta: Cuenta): Promise<void> {
        const id = cuenta.obtenerId();
        if (id === undefined) {
            throw new Error("No se puede actualizar una cuenta sin id");
        }
        await this.pool.query(
            `UPDATE BancoFuego.Cuenta
                SET saldo = $1, activa = $2
                WHERE id_cuenta = $3`,
            [cuenta.obtenerSaldo().toNumber(), cuenta.estaActiva(), id],
        );
    }

    private aEntidad(fila: FilaCuenta): Cuenta {
        return Cuenta.reconstruir({
            id: fila.id_cuenta,
            numeroCuenta: NumeroCuenta.desde(fila.numero_cuenta),
            tipo: fila.tipo,
            saldo: Dinero.desde(parseFloat(fila.saldo)),
            fechaCreacion: fila.fecha_creacion,
            activa: fila.activa,
            idCliente: fila.id_cliente,
            idBanco: fila.id_banco,
        });
    }

    private obtenerTipo(cuenta: Cuenta): TipoCuenta {
        return cuenta.obtenerTipo();
    }

    private obtenerIdBanco(cuenta: Cuenta): number {
        return cuenta.obtenerIdBanco();
    }
}