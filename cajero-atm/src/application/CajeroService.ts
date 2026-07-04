import { generarId } from "../domain/generarId";
import { Dinero } from "../domain/Dinero";
import {
  Cuenta,
  Pin,
  ResultadoConsulta,
  ResultadoDeposito,
  ResultadoRetiro,
  Transaccion,
  TipoTransaccion,
} from "../domain/types";

const LIMITE_DEPOSITO = new Dinero(10000);

export class CajeroService {
  retirar(cuenta: Cuenta, montoSolicitado: number, pinIngresado: Pin): ResultadoRetiro {
    if (pinIngresado !== cuenta.pin) {
      return { exito: false, error: "PIN_INCORRECTO" };
    }
    if (!cuenta.activa) {
      return { exito: false, error: "CUENTA_INACTIVA" };
    }

    const monto = new Dinero(montoSolicitado);
    if (monto.esMayorQue(cuenta.saldo)) {
      return { exito: false, error: "SALDO_INSUFICIENTE" };
    }

    // Reemplazamos el saldo por un Dinero NUEVO (no lo mutamos por dentro)
    cuenta.saldo = cuenta.saldo.restar(monto);

    const transaccion: Transaccion = {
      id: generarId(),
      tipo: TipoTransaccion.Retiro,
      monto,
      fecha: new Date(),
      numeroCuenta: cuenta.numeroCuenta,
    };

    return { exito: true, nuevoSaldo: cuenta.saldo, transaccion };
  }

  depositar(cuenta: Cuenta, montoSolicitado: number): ResultadoDeposito {
    if (!cuenta.activa) {
      return { exito: false, error: "CUENTA_INACTIVA" };
    }
    if (montoSolicitado <= 0) {
      return { exito: false, error: "MONTO_INVALIDO" };
    }

    const monto = new Dinero(montoSolicitado);
    if (monto.esMayorQue(LIMITE_DEPOSITO)) {
      return { exito: false, error: "LIMITE_EXCEDIDO" };
    }

    cuenta.saldo = cuenta.saldo.sumar(monto);

    const transaccion: Transaccion = {
      id: generarId(),
      tipo: TipoTransaccion.Deposito,
      monto,
      fecha: new Date(),
      numeroCuenta: cuenta.numeroCuenta,
    };

    return { exito: true, nuevoSaldo: cuenta.saldo, transaccion };
  }

  consultarSaldo(cuenta: Cuenta): ResultadoConsulta {
    if (!cuenta.activa) {
      return { exito: false, error: "CUENTA_INACTIVA" };
    }
    return { exito: true, saldo: cuenta.saldo };
  }
}
