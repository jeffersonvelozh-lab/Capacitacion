const readline = require("readline");

// ==========================================
// VALUE OBJECT: Dinero
// ==========================================
// Un Value Object se identifica por su VALOR, no por una identidad única.
// Dos "Dinero" con el mismo monto son intercambiables. Además, es INMUTABLE:
// Object.freeze() impide que alguien modifique sus propiedades después de
// creado. Cualquier "cambio" crea un objeto Dinero nuevo.
interface Dinero {
    readonly monto: number;
}

function crearDinero(monto: number): Dinero {
    if (monto < 0) {
        throw new Error("El monto de dinero no puede ser negativo.");
    }
    // Redondeamos a 2 decimales para evitar errores de precisión con floats
    const montoRedondeado = Math.round(monto * 100) / 100;
    return Object.freeze({ monto: montoRedondeado });
}

function sumarDinero(a: Dinero, b: Dinero): Dinero {
    return crearDinero(a.monto + b.monto);
}

function restarDinero(a: Dinero, b: Dinero): Dinero {
    return crearDinero(a.monto - b.monto);
}

// ==========================================
// TIPOS COMPUESTOS Y DISCRIMINATED UNIONS
// ==========================================
type TipoTransaccion = "deposito" | "retiro";

// Genérico: Registro<T> puede envolver cualquier tipo de evento, no solo
// transacciones del cajero. Aquí lo usamos con T = DetalleTransaccion.
interface Registro<T> {
    fecha: Date;
    detalle: T;
}

interface DetalleTransaccion {
    tipo: TipoTransaccion;
    monto: Dinero;
    saldoResultante: Dinero;
}

// Discriminated union: el campo "tipo" es el "discriminante". TypeScript usa
// ese campo para saber qué otras propiedades existen en cada caso.
type ResultadoOperacion =
    | { tipo: "exito"; mensaje: string; saldoActual: Dinero }
    | { tipo: "error"; mensaje: string };

// ==========================================
// CUENTA BANCARIA CON CLOSURE (encapsulación real)
// ==========================================
// Igual que "crearCalculadoraFactorial" escondía el cache, aquí "saldo" y
// "historial" viven dentro del closure de crearCuenta(). Nadie fuera de esta
// función puede leerlos o mutarlos directamente: solo a través de los
// métodos que devolvemos (depositar, retirar, consultarSaldo, verHistorial).
function crearCuenta(titular: string, saldoInicial: Dinero) {
    let saldo: Dinero = saldoInicial;
    const historial: Registro<DetalleTransaccion>[] = [];

    function registrarMovimiento(tipo: TipoTransaccion, monto: Dinero): void {
        historial.push({
            fecha: new Date(),
            detalle: { tipo, monto, saldoResultante: saldo },
        });
    }

    function depositar(monto: Dinero): ResultadoOperacion {
        if (monto.monto <= 0) {
            return { tipo: "error", mensaje: "El monto a depositar debe ser mayor a 0." };
        }

        saldo = sumarDinero(saldo, monto);
        registrarMovimiento("deposito", monto);

        return {
            tipo: "exito",
            mensaje: `Depósito de $${monto.monto} realizado.`,
            saldoActual: saldo,
        };
    }

    function retirar(monto: Dinero): ResultadoOperacion {
        if (monto.monto <= 0) {
            return { tipo: "error", mensaje: "El monto a retirar debe ser mayor a 0." };
        }
        if (monto.monto > saldo.monto) {
            return { tipo: "error", mensaje: "Fondos insuficientes." };
        }

        saldo = restarDinero(saldo, monto);
        registrarMovimiento("retiro", monto);

        return {
            tipo: "exito",
            mensaje: `Retiro de $${monto.monto} realizado.`,
            saldoActual: saldo,
        };
    }

    function consultarSaldo(): Dinero {
        return saldo;
    }

    function verHistorial(): Registro<DetalleTransaccion>[] {
        // Devolvemos una copia (spread) para que nadie mute el historial real
        // desde afuera -- mismo principio que usamos en ordenPorPromedioDescendente
        return [...historial];
    }

    return { titular, depositar, retirar, consultarSaldo, verHistorial };
}

// El tipo de lo que devuelve crearCuenta, para poder tipar la variable
type Cuenta = ReturnType<typeof crearCuenta>;

// ==========================================
// LECTURA DE CONSOLA
// ==========================================
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function pedirRespuesta(pregunta: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(pregunta, (respuesta: string) => resolve(respuesta));
    });
}

// ==========================================
// FUNCIONES DEL MENÚ
// ==========================================
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

// Manejo del discriminated union: TypeScript exige revisar "tipo" antes de
// acceder a "saldoActual", porque solo existe en el caso "exito".
function mostrarResultado(resultado: ResultadoOperacion): void {
    if (resultado.tipo === "exito") {
        console.log(`✅ ${resultado.mensaje} Saldo actual: $${resultado.saldoActual.monto}`);
    } else {
        console.log(`❌ ${resultado.mensaje}`);
    }
}

async function depositarMenu(cuenta: Cuenta): Promise<void> {
    const montoTexto = await pedirRespuesta("Monto a depositar: ");
    const montoNumero = Number(montoTexto);

    if (isNaN(montoNumero)) {
        console.log("❌ Monto inválido.");
        return;
    }

    const resultado = cuenta.depositar(crearDinero(montoNumero));
    mostrarResultado(resultado);
}

async function retirarMenu(cuenta: Cuenta): Promise<void> {
    const montoTexto = await pedirRespuesta("Monto a retirar: ");
    const montoNumero = Number(montoTexto);

    if (isNaN(montoNumero)) {
        console.log("❌ Monto inválido.");
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

// ==========================================
// BUCLE PRINCIPAL
// ==========================================
async function main(): Promise<void> {
    const nombreTitular = await pedirRespuesta("Ingresa tu nombre: ");
    const cuenta = crearCuenta(nombreTitular.trim(), crearDinero(100)); // saldo inicial de ejemplo

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
                console.log(`Gracias por usar el cajero, ${cuenta.titular}. ¡Hasta luego!`);
                salir = true;
                break;
            default:
                console.log("Opción inválida. Intenta de nuevo.");
        }
    }

    rl.close();
}

main();