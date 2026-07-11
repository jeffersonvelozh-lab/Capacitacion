// Application/Services/RetirarDineroService.ts
import { ITarjetaRepository } from "../Ports/ITarjetaRepository";
import { IAutenticacionRepository } from "../Ports/IAutenticacionRepository";
import { ICuentaRepository } from "../Ports/ICuentaRepository";
import { ITransaccionRepository } from "../Ports/ITransaccionRepository";
import { IMovimientoRepository } from "../Ports/IMovimientoRepository";
import { IPinHasher } from "../../Domain/Value-Objects/PinHasher";
import { NumeroTarjeta } from "../../Domain/Value-Objects/NumeroTarjeta";
import { Dinero } from "../../Domain/Value-Objects/Dinero";
import { Transaccion } from "../../Domain/Entities/Transaccion";
import { Movimiento } from "../../Domain/Entities/Movimiento";
import { PinTextoPlano } from "../../Domain/Value-Objects/Pin";

export interface RetirarDineroComando {
    numeroTarjeta: string;
    pin: string;
    monto: number;
    idCajero: number;
}

export interface RetirarDineroResultado {
    transaccion: Transaccion;
    movimiento: Movimiento;
    saldoNuevo: Dinero;
}

export class RetirarDineroService {
    constructor(
        private readonly tarjetaRepo: ITarjetaRepository,
        private readonly autenticacionRepo: IAutenticacionRepository,
        private readonly cuentaRepo: ICuentaRepository,
        private readonly transaccionRepo: ITransaccionRepository,
        private readonly movimientoRepo: IMovimientoRepository,
        private readonly pinHasher: IPinHasher,
    ) {}

    async ejecutar(comando: RetirarDineroComando): Promise<RetirarDineroResultado> {
        // 1. Localizar y validar la tarjeta
        const numeroTarjeta = NumeroTarjeta.desde(comando.numeroTarjeta);
        const tarjeta = await this.tarjetaRepo.buscarPorNumero(numeroTarjeta);
        if (!tarjeta) {
            throw new Error('Tarjeta no encontrada');
        }
        tarjeta.asegurarUsable(); // lanza si está bloqueada o vencida

        // 2. Autenticación — se persiste SIEMPRE, sin importar el resultado,
        //    porque necesitamos guardar el conteo de intentos incluso si falla.
        const idTarjeta = tarjeta.obtenerId()!;
        const autenticacion = await this.autenticacionRepo.buscarPorIdTarjeta(idTarjeta);
        if (!autenticacion) {
            throw new Error('No existe autenticación registrada para esta tarjeta');
        }

        const pinCorrecto = await autenticacion.verificarPin
        (
            PinTextoPlano.desde(comando.pin), this.pinHasher,
        );
        await this.autenticacionRepo.guardar(autenticacion);

        if (!pinCorrecto) {
            throw new Error('PIN incorrecto');
        }

        // 3. Operación de dinero sobre la cuenta
        const cuenta = await this.cuentaRepo.buscarPorId(tarjeta.obtenerIdCuenta());
        if (!cuenta) {
            throw new Error('Cuenta no encontrada');
        }

        const monto = Dinero.desde(comando.monto);
        let transaccion: Transaccion;
        let movimiento: Movimiento;

        try {
        const { saldoAnterior, saldoNuevo } = cuenta.retirar(monto);

        transaccion = await this.transaccionRepo.guardar(
            Transaccion.crear({
            tipo: 'RETIRO',
            monto,
            estado: 'EXITOSA',
            idCajero: comando.idCajero,
            }),
        );

        movimiento = Movimiento.crear({
            tipo: 'RETIRO',
            monto,
            saldoAnterior,
            saldoNuevo,
            idCuenta: cuenta.obtenerId()!,
            idTransaccion: transaccion.obtenerId()!,
        });
        await this.movimientoRepo.guardar(movimiento);

        // Solo persistimos la cuenta si el retiro sí tuvo efecto
        await this.cuentaRepo.guardar(cuenta);
        } catch (error) {
        // Fondos insuficientes o cuenta inactiva: igual dejamos rastro
        const saldoActual = cuenta.obtenerSaldo();

        transaccion = await this.transaccionRepo.guardar(
            Transaccion.crear({
            tipo: 'RETIRO',
            monto,
            estado: 'FALLIDA',
            descripcion: error instanceof Error ? error.message : 'Error desconocido',
            idCajero: comando.idCajero,
            }),
        );

        movimiento = Movimiento.crear({
            tipo: 'RETIRO',
            monto,
            saldoAnterior: saldoActual,
            saldoNuevo: saldoActual, // sin cambio, igual que tu seed data
            idCuenta: cuenta.obtenerId()!,
            idTransaccion: transaccion.obtenerId()!,
        });
        await this.movimientoRepo.guardar(movimiento);

            throw error; // el llamador (controller) decide cómo responder al usuario
    }

        return { transaccion, movimiento, saldoNuevo: cuenta.obtenerSaldo() };
    }
}