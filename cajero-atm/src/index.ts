import { Dinero } from "./domain/Dinero";
import { Cuenta } from "./domain/types";
import { CajeroService } from "./application/CajeroService";
import { RepositorioCuentas } from "./infrastructure/RepositorioCuentas";

function separador(titulo: string) {
  console.log("\n" + "=".repeat(50));
  console.log(titulo);
  console.log("=".repeat(50));
}

// ===== SETUP =====
const repositorio = new RepositorioCuentas();
const cajero = new CajeroService();

const cuentaInicial: Cuenta = {
  numeroCuenta: "0012345678",
  saldo: new Dinero(500),
  pin: "1234",
  activa: true,
};

repositorio.guardar(cuentaInicial);

// ===== 1) CONSULTA DE SALDO =====
separador("1) CONSULTA DE SALDO");
const cuenta = repositorio.buscarPorNumero("0012345678")!;
const consulta = cajero.consultarSaldo(cuenta);
if (consulta.exito) {
  console.log(`Saldo actual: ${consulta.saldo.toString()}`);
}

// ===== 2) RETIRO EXITOSO =====
separador("2) RETIRO EXITOSO ($100)");
const retiro1 = cajero.retirar(cuenta, 100, "1234");
if (retiro1.exito) {
  console.log(`Retiro OK. Nuevo saldo: ${retiro1.nuevoSaldo.toString()}`);
  console.log(`Transacción registrada: ${retiro1.transaccion.id}`);
} else {
  console.log(`Retiro fallido: ${retiro1.error}`);
}

// ===== 3) RETIRO FALLIDO: PIN INCORRECTO =====
separador("3) RETIRO FALLIDO (PIN incorrecto)");
const retiro2 = cajero.retirar(cuenta, 50, "9999");
if (retiro2.exito) {
  console.log(`Retiro OK. Nuevo saldo: ${retiro2.nuevoSaldo.toString()}`);
} else {
  console.log(`Retiro fallido: ${retiro2.error}`);
}

// ===== 4) RETIRO FALLIDO: SALDO INSUFICIENTE =====
separador("4) RETIRO FALLIDO (saldo insuficiente)");
const retiro3 = cajero.retirar(cuenta, 999999, "1234");
if (retiro3.exito) {
  console.log(`Retiro OK. Nuevo saldo: ${retiro3.nuevoSaldo.toString()}`);
} else {
  console.log(`Retiro fallido: ${retiro3.error}`);
}

// ===== 5) DEPÓSITO EXITOSO =====
separador("5) DEPÓSITO EXITOSO ($200)");
const deposito1 = cajero.depositar(cuenta, 200);
if (deposito1.exito) {
  console.log(`Depósito OK. Nuevo saldo: ${deposito1.nuevoSaldo.toString()}`);
} else {
  console.log(`Depósito fallido: ${deposito1.error}`);
}

// ===== 6) DEPÓSITO FALLIDO: EXCEDE EL LÍMITE =====
separador("6) DEPÓSITO FALLIDO (excede límite de $10,000)");
const deposito2 = cajero.depositar(cuenta, 15000);
if (deposito2.exito) {
  console.log(`Depósito OK. Nuevo saldo: ${deposito2.nuevoSaldo.toString()}`);
} else {
  console.log(`Depósito fallido: ${deposito2.error}`);
}

// ===== 7) DEMOSTRACIÓN: REFERENCIA vs COPIA (memoria) =====
separador("7) DEMOSTRACIÓN DE MEMORIA: referencia vs copia");

console.log(`Estado ANTES -> activa: ${cuenta.activa}`);

// "copia" NO es una copia real, apunta al MISMO objeto en el Heap
const referenciaCompartida = cuenta;
referenciaCompartida.activa = false;

console.log(`Después de modificar "referenciaCompartida.activa = false":`);
console.log(`  referenciaCompartida.activa = ${referenciaCompartida.activa}`);
console.log(`  cuenta.activa (el "original")  = ${cuenta.activa}`);
console.log(`  -> Son el MISMO objeto, por eso ambos cambiaron.`);

// Reactivamos para seguir probando
cuenta.activa = true;

// Ahora sí, una copia real e independiente
const copiaReal = repositorio.copiarCuenta(cuenta);
copiaReal.activa = false;

console.log(`\nUsando copiarCuenta() (copia real e independiente):`);
console.log(`  copiaReal.activa = ${copiaReal.activa}`);
console.log(`  cuenta.activa    = ${cuenta.activa}`);
console.log(`  -> Son objetos DISTINTOS, modificar uno no afecta al otro.`);

// ===== 8) DEMOSTRACIÓN: VALUE TYPE vs REFERENCE TYPE con primitivos =====
separador("8) VALUE TYPE (primitivo) vs REFERENCE TYPE (objeto)");

let a: number = 5;
let b: number = a; // copia el VALOR
b = 10;
console.log(`Primitivos -> a = ${a}, b = ${b} (independientes)`);

const dinero1 = new Dinero(100);
// dinero2 comparte la MISMA instancia, pero como Dinero es inmutable,
// no hay riesgo: no existe ningún método que lo mute por dentro.
const dinero2 = dinero1;
const dinero3 = dinero2.sumar(new Dinero(50)); // esto crea un objeto NUEVO
console.log(`Dinero (inmutable) -> dinero1 = ${dinero1}, dinero3 (nuevo) = ${dinero3}`);

console.log("\nFin de la demostración.\n");
