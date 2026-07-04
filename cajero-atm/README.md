# Cajero ATM — Ejercicio de Tipado y Arquitectura en TypeScript

Proyecto de ejemplo para practicar:
- Tipado estático y fuerte (TypeScript)
- Tipos primitivos vs. tipos compuestos
- Value Objects inmutables
- Discriminated Unions para manejo seguro de errores
- Diferencia entre "referencia" y "copia" en memoria (value types vs reference types)
- Organización en capas (Domain / Application / Infrastructure), como en arquitectura hexagonal

## Estructura del proyecto

```
cajero-atm/
├── src/
│   ├── domain/
│   │   ├── Dinero.ts          # Value Object inmutable para manejar montos
│   │   ├── types.ts           # Tipos primitivos, enum, entidades y resultados
│   │   └── generarId.ts       # Utilidad simple para generar IDs
│   ├── application/
│   │   └── CajeroService.ts   # Lógica de negocio: retirar, depositar, consultar
│   ├── infrastructure/
│   │   └── RepositorioCuentas.ts  # Persistencia simulada en memoria (Map)
│   └── index.ts               # Punto de entrada: ejecuta y muestra la demo
├── package.json
├── tsconfig.json
└── README.md
```

## Requisitos

- Node.js 18 o superior instalado en tu máquina.

## Instalación

Abre una terminal dentro de la carpeta `cajero-atm` y ejecuta:

```bash
npm install
```

Esto instala `typescript` y `ts-node` como dependencias de desarrollo.

## Ejecutar el proyecto

**Opción 1 — Modo desarrollo (recomendado mientras aprendes):**

```bash
npm run dev
```

Esto usa `ts-node` para ejecutar el TypeScript directamente, sin necesidad de compilar antes.

**Opción 2 — Compilar y luego ejecutar (como sería en producción):**

```bash
npm run build
npm start
```

`npm run build` compila todo `src/` a JavaScript dentro de `dist/`, y `npm start` ejecuta ese JavaScript compilado con Node.

## Qué vas a ver al ejecutarlo

El archivo `src/index.ts` corre automáticamente 8 escenarios en consola:

1. Consulta de saldo
2. Retiro exitoso
3. Retiro fallido por PIN incorrecto
4. Retiro fallido por saldo insuficiente
5. Depósito exitoso
6. Depósito fallido por exceder el límite de $10,000
7. Demostración de **referencia vs. copia** en memoria (el bug clásico de objetos compartidos)
8. Demostración de **value type vs. reference type** con primitivos y con el Value Object `Dinero`

## Cómo experimentar (para reforzar lo aprendido)

Prueba modificar `src/index.ts` y observa qué pasa:

- Cambia el PIN al llamar `cajero.retirar(...)` y confirma que TypeScript no te deja acceder a `nuevoSaldo` si no comprobaste `resultado.exito` primero.
- Intenta crear `new Dinero(-100)` y observa el error que lanza el constructor.
- Intenta escribir `cuenta.saldo._monto = 999` directamente (sin pasar por los métodos) — TypeScript te lo va a bloquear porque `_monto` es `private`.
- Agrega un nuevo tipo de error a `ResultadoRetiro` (por ejemplo `"CUENTA_BLOQUEADA"`) y observa cómo TypeScript te obliga a manejarlo en cualquier lugar donde uses ese resultado con un `switch` exhaustivo.

## Próximo paso sugerido

Si quieres llevar este mismo patrón a tu proyecto real (MediCita), la idea es la misma:
- `Dinero` → sería como tu `CodigoPublico` o cualquier Value Object de negocio.
- `ResultadoRetiro`/`ResultadoDeposito` → se traduce directo a algo como `ResultadoAgendarCita`.
- `RepositorioCuentas` → es exactamente el rol de tus repositorios de Infrastructure con Entity Framework Core.
