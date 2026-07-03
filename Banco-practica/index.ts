// ===== PRIMITIVOS =====

type NumeroCuenta = string; // aunque parezca numérico, es un identificador, no una cantidad
type Pin = string;          // mismo caso que discutimos: "0090" con ceros importa

// ===== ENUM: conjunto cerrado de opciones válidas =====
enum TipoTransaccion {
  Retiro = "RETIRO",
  Deposito = "DEPOSITO",
  ConsultaSaldo = "CONSULTA_SALDO",
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
    this._monto = Math.round(monto * 100) / 100; // evita errores de punto flotante
    Object.freeze(this); // congela el objeto: nadie puede mutar _monto después
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

// ===== TIPO COMPUESTO: la entidad Cuenta =====
interface Cuenta {
  readonly numeroCuenta: NumeroCuenta;
  saldo: Dinero;
  readonly pin: Pin;
  activa: boolean;
}

// ===== TIPO COMPUESTO: registro de una transacción =====
interface Transaccion {
  readonly id: string;
  readonly tipo: TipoTransaccion;
  readonly monto: Dinero;
  readonly fecha: Date;
  readonly numeroCuenta: NumeroCuenta;
}


// ===== RESULTADOS: el compilador te obliga a manejar éxito Y error =====
type ResultadoRetiro =
  | { exito: true; nuevoSaldo: Dinero; transaccion: Transaccion }
  | { exito: false; error: "PIN_INCORRECTO" | "CUENTA_INACTIVA" | "SALDO_INSUFICIENTE" };

type ResultadoDeposito =
  | { exito: true; nuevoSaldo: Dinero; transaccion: Transaccion }
  | { exito: false; error: "MONTO_INVALIDO" | "LIMITE_EXCEDIDO" | "CUENTA_INACTIVA" };

type ResultadoConsulta =
  | { exito: true; saldo: Dinero }
  | { exito: false; error: "CUENTA_INACTIVA" };

const LIMITE_DEPOSITO = new Dinero(10000);

// ===== CASOS DE USO =====
class CajeroService {
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

    // OJO: mutamos cuenta.saldo asignando un objeto NUEVO,
    // no llamando un método que "cambie por dentro" al Dinero anterior
    cuenta.saldo = cuenta.saldo.restar(monto);

    const transaccion: Transaccion = {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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


class RepositorioCuentas {
  // Simula el Heap "persistente" del sistema: un solo lugar
  // donde viven los objetos reales
  private cuentas: Map<NumeroCuenta, Cuenta> = new Map();

  guardar(cuenta: Cuenta): void {
    this.cuentas.set(cuenta.numeroCuenta, cuenta);
  }

  buscarPorNumero(numeroCuenta: NumeroCuenta): Cuenta | undefined {
    return this.cuentas.get(numeroCuenta);
    // OJO: esto devuelve la REFERENCIA real. Si el que llama la modifica,
    // modifica el "original" guardado aquí. Lo vemos abajo.
  }
}


const repositorio = new RepositorioCuentas();
const cajero = new CajeroService();

repositorio.guardar({
  numeroCuenta: "0012345678",
  saldo: new Dinero(500),
  pin: "1234",
  activa: true,
});

const cuenta = repositorio.buscarPorNumero("0012345678")!;

const resultado = cajero.retirar(cuenta, 100, "1234");

if (resultado.exito) {
  console.log(`Retiro OK. Nuevo saldo: $${resultado.nuevoSaldo.valor}`);
  // TypeScript sabe que aquí "nuevoSaldo" existe con certeza
} else {
  console.log(`Retiro fallido: ${resultado.error}`);
  // Aquí sabe que "error" existe, no "nuevoSaldo"
}

function mostrarResumen(cuenta: Cuenta) {
  console.log(`Cuenta ${cuenta.numeroCuenta}: $${cuenta.saldo.valor}`);
}

function operacionRiesgosa(cuenta: Cuenta) {
  // Esto NO crea una copia, "copia" apunta al MISMO objeto en el Heap
  const copia = cuenta;
  copia.activa = false; // esto desactiva la cuenta ORIGINAL también

  // cuenta.activa también es false ahora, aunque nunca tocaste "cuenta" directamente
}

function copiarCuenta(cuenta: Cuenta): Cuenta {
  return {
    numeroCuenta: cuenta.numeroCuenta,
    saldo: cuenta.saldo, // Dinero es inmutable, compartir la referencia es seguro
    pin: cuenta.pin,
    activa: cuenta.activa,
  };
}