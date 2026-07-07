import readline = require ("readline");
import BehaviorSubject = require("rxjs/internal/BehaviorSubject");
import Subject = require("rxjs/internal/Subject");
import operators = require("rxjs/operators");
import EventEmitter = require("events");

//Datos conpuestos
type TipoTransaccion = "deposito" | "retiro";

type ResultadoOperacion =
    | { tipo: "exito"; mensaje: string; saldoActual: Dinero }
    | { tipo: "error"; mensaje: string };

// Genérico: Registro<T> puede envolver cualquier tipo de evento
interface Registro<T> {
    fecha: Date;
    detalle: T;
}

interface DetalleTransaccion {
    tipo: TipoTransaccion;
    monto: Dinero;
    saldoResultante: Dinero;
}

interface Dinero {
    readonly monto: number;
}

//Funciones
function memoizar<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<T, R>();
    return (arg: T): R => {
        if (cache.has(arg)) {
            return cache.get(arg)!;
        }
        const resultado = fn(arg); // si fn lanza error, no se cachea
        cache.set(arg, resultado);
        return resultado;
    };
}

function crearDineroBase(monto: number): Dinero {
    if (monto < 0) {
        throw new Error("El monto de dinero no puede ser negativo.");
    }
    // aqui se redondea el monto a dos decimales
    const montoRedondeado = Math.round(monto * 100) / 100;
    return Object.freeze({ monto: montoRedondeado });
}

const crearDinero = memoizar(crearDineroBase);

function sumarDinero(a: Dinero, b: Dinero): Dinero {
    return crearDinero(a.monto + b.monto);
}

function restarDinero(a: Dinero, b: Dinero): Dinero {
    return crearDinero(a.monto - b.monto);
}


//Programacióm Orientada a Objetos
//Tratando "cuenta" como una clase
class Cuenta extends EventEmitter {
    private saldo: Dinero;
    private historial: Registro<DetalleTransaccion>[] = [];
    
    // Flujos reactivos
    public readonly saldo$: BehaviorSubject.BehaviorSubject<Dinero>;
    public readonly transacciones$ = new Subject.Subject<DetalleTransaccion>();

    constructor(public readonly titular: string, saldoInicial: Dinero) {
        super(); // es obligario llamar super para usar eventemiter
        this.saldo = saldoInicial;
        this.saldo$ = new BehaviorSubject.BehaviorSubject<Dinero>(this.saldo);
    }

    private registrarMovimiento(tipo: TipoTransaccion, monto: Dinero): void {
        const detalle: DetalleTransaccion = {tipo, monto, saldoResultante: this.saldo};
        this.historial.push({ fecha: new Date(), detalle });

        this.transacciones$.next(detalle); //reactiva
        this.emit("transacción", detalle) //Orientada a eventos
    }

    depositar(monto: Dinero): ResultadoOperacion {
        
        if (monto.monto <= 0) {
            return { tipo: "error", mensaje: "El monto a depositar debe ser mayor a 0." };
        }

        this.saldo = sumarDinero(this.saldo, monto);
        this.saldo$.next(this.saldo); //emitimos el nuevo saldo reactivo
        this.emit("SaldoActualizado", this.saldo); //Orientada a eventos
        this.registrarMovimiento("deposito", monto);

        return {
            tipo: "exito",
            mensaje: `Depósito de $${monto.monto} realizado.`,
            saldoActual: this.saldo,
        };
    }

    retirar(monto: Dinero): ResultadoOperacion {
        if (monto.monto <= 0) {
            return { tipo: "error", mensaje: "El monto a retirar debe ser mayor a 0." };
        }
        if (monto.monto > this.saldo.monto) {
            return { tipo: "error", mensaje: "Fondos insuficientes." };
        }

        this.saldo = restarDinero(this.saldo, monto);
        this.saldo$.next(this.saldo); // <-- emitimos el nuevo saldo reactiva
        this.emit("SaldoActualizado", this.saldo); //orientada a eventos
        this.registrarMovimiento("retiro", monto);

        return {
            tipo: "exito",
            mensaje: `Retiro de $${monto.monto} realizado.`,
            saldoActual: this.saldo,
        };
    }

    consultarSaldo(): Dinero {
        return this.saldo;
    }

    verHistorial(): Registro<DetalleTransaccion>[] {
        return [...this.historial];
    }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function pedirRespuesta(pregunta: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(pregunta, (respuesta: string) => resolve(respuesta));
    });
}

// Menú
function mostrarMenu(): void {
    console.log(`
===== CAJERO AUTOMÁTICO =====
1. Consultar saldo
2. Depositar
3. Retirar
4. Ver historial de transacciones
5. Salir
`);
}

// se exige revisar "tipo" antes de acceder a "saldoActual", 
// porque solo existe en el caso "exito".
function mostrarResultado(resultado: ResultadoOperacion): void {
    if (resultado.tipo === "exito") {
        console.log(`${resultado.mensaje} Saldo actual: $${resultado.saldoActual.monto}`);
    } else {
        console.log(`${resultado.mensaje}`);
    }
}

async function depositarMenu(cuenta: Cuenta): Promise<void> {
    const montoTexto = await pedirRespuesta("Monto a depositar: ");
    const montoNumero = Number(montoTexto);

    if (isNaN(montoNumero)) {
        console.log("Monto inválido.");
        return;
    }

    const resultado = cuenta.depositar(crearDinero(montoNumero));
    mostrarResultado(resultado);
}

async function retirarMenu(cuenta: Cuenta): Promise<void> {
    const montoTexto = await pedirRespuesta("Monto a retirar: ");
    const montoNumero = Number(montoTexto);

    if (isNaN(montoNumero)) {
        console.log(" Monto inválido.");
        return;
    }

    const resultado = cuenta.retirar(crearDinero(montoNumero));
    mostrarResultado(resultado);
}

function verHistorialMenu(cuenta: Cuenta): void {
    const historial = cuenta.verHistorial();

    if (historial.length === 0) {
        console.log("No hay transacciones registradas todavía.");
        return;
    }

    console.log("\n--- Historial de transacciones ---");
    historial.forEach((registro, index) => {
        const { tipo, monto, saldoResultante } = registro.detalle;
        const etiqueta = tipo === "deposito" ? "Depósito" : "Retiro";
        console.log(
            `${index + 1}. [${registro.fecha.toLocaleTimeString()}] ${etiqueta}: $${monto.monto} -> Saldo: $${saldoResultante.monto}`
        );
    });
}

// Funcion principal MAIN 
async function main(): Promise<void> {
    const nombreTitular = await pedirRespuesta("Ingresa tu nombre: ");
    const cuenta = new Cuenta(nombreTitular.trim(), crearDinero(100)); // saldo inicial de ejemplo

     //Cada vez que el saldo cambia, se imprime automáticamente Reactivo
    cuenta.saldo$.subscribe((saldo) => {
        console.log(`[reactivo] Saldo actualizado -> $${saldo.monto}`);
    });

    // Alerta cuando un retiro supera los $500
    cuenta.transacciones$
        .pipe(operators.filter((t) => t.tipo === "retiro" && t.monto.monto > 500))
        .subscribe((t) => {
            console.log(`[alerta] Retiro grande detectado: $${t.monto.monto}`);
        });

    // Programacion orientada a eventos
    cuenta.on("saldoActualizado", (saldo: Dinero) => {
        console.log(`[evento] Saldo actualizado -> $${saldo.monto}`);
    });

    cuenta.on("transaccion", (t: DetalleTransaccion) => {
        if (t.tipo === "retiro" && t.monto.monto > 500) {
            console.log(`[alerta-evento] Retiro grande detectado: $${t.monto.monto}`);
        }
    });

    let salir = false;

    while (!salir) {
        mostrarMenu();
        const opcion = await pedirRespuesta("Elige una opción: ");

        switch (opcion.trim()) {
            case "1":
                console.log(`Saldo actual: $${cuenta.consultarSaldo().monto}`);
                break;
            case "2":
                await depositarMenu(cuenta);
                break;
            case "3":
                await retirarMenu(cuenta);
                break;
            case "4":
                verHistorialMenu(cuenta);
                break;
            case "5":
                console.log(`Gracias por usar el cajero, ${cuenta.titular}.`);
                salir = true;
                break;
            default:
                console.log("Opción inválida. Intenta de nuevo.");
        }
    }

    rl.close();
}

main();