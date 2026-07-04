const readline = require("readline");

// ==========================================
// TIPOS DE DATOS COMPUESTOS
// ==========================================
interface Estudiante {
    nombre: string;
    edad: number;
    promedio: number;
    matriculado: boolean;
}

const estudiantes: Estudiante[] = [
    { nombre: "estudiante 1", edad: 14, promedio: 8, matriculado: true },
    { nombre: "estudiante 2", edad: 14, promedio: 8.5, matriculado: true },
    { nombre: "estudinate 3", edad: 15, promedio: 9.3, matriculado: true },
    { nombre: "estudiante 4", edad: 15, promedio: 6.9, matriculado: true },
    { nombre: "estudiante 5", edad: 14, promedio: 7.1, matriculado: true },
];

// ==========================================
// FUNCIONES YA CONOCIDAS (sin cambios de lógica)
// ==========================================
function aprobo(estudiante: Estudiante): string {
    if (estudiante.promedio >= 7) {
        return `${estudiante.nombre} esta APROBADO con: ${estudiante.promedio}`;
    }
    return `${estudiante.nombre} esta REPROBADO con: ${estudiante.promedio}`;
}

function promedioGeneral(estudiantes: Estudiante[]): number {
    if (estudiantes.length === 0) return 0;
    let sumaTotal = 0;
    for (const alumno of estudiantes) {
        sumaTotal += alumno.promedio;
    }
    return sumaTotal / estudiantes.length;
}

const obtenerAprobados = (estudiantes: Estudiante[]): string[] =>
    estudiantes.filter((alumno) => alumno.promedio >= 7).map((alumno) => alumno.nombre);

const buscarEstudianteNombre = (
    estudiantes: Estudiante[],
    nombreBuscar: string
): Estudiante | undefined => {
    return estudiantes.find(
        (alumno) => alumno.nombre.toLowerCase() === nombreBuscar.toLowerCase()
    );
};

// ==========================================
// NUEVO: LECTURA DE CONSOLA (ASÍNCRONO)
// ==========================================
// readline trabaja con "callbacks" por defecto. Para poder usar await con él,
// lo envolvemos en una función que devuelve una Promise. Esto es un patrón
// muy común: "promisificar" una API basada en callbacks.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function pedirRespuesta(pregunta: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(pregunta, (respuesta: string | PromiseLike<string>) => {
            resolve(respuesta);
        });
    });
}

// ==========================================
// NUEVO: FUNCIONES DEL MENÚ
// ==========================================
function mostrarMenu(): void {
    console.log(`
===== MENÚ =====
1. Ver estudiantes
2. Agregar estudiante
3. Buscar estudiante
4. Ver aprobados
5. Ver promedio general
6. Salir
`);
}

function verEstudiantes(estudiantes: Estudiante[]): void {
    if (estudiantes.length === 0) {
        console.log("No hay estudiantes registrados.");
        return;
    }
    console.log("\n--- Lista de estudiantes ---");
    estudiantes.forEach((alumno, index) => {
        console.log(
            `${index + 1}. ${alumno.nombre} | Edad: ${alumno.edad} | Promedio: ${alumno.promedio} | ${aprobo(alumno)}`
        );
    });
}

// Nota: a diferencia de "ordenPorPromedioDescendente" (que devolvía una copia
// nueva para no mutar nada), aquí SÍ queremos mutar el arreglo "estudiantes"
// con .push(), porque la intención real de "agregar" es modificar la lista
// que el programa está usando en memoria durante la ejecución.
async function agregarEstudiante(estudiantes: Estudiante[]): Promise<void> {
    const nombre = await pedirRespuesta("Nombre del estudiante: ");
    const edadTexto = await pedirRespuesta("Edad: ");
    const promedioTexto = await pedirRespuesta("Promedio: ");

    const edad = Number(edadTexto);
    const promedio = Number(promedioTexto);

    if (nombre.trim() === "" || isNaN(edad) || isNaN(promedio)) {
        console.log("Datos inválidos. No se agregó el estudiante.");
        return;
    }

    estudiantes.push({
        nombre: nombre.trim(),
        edad,
        promedio,
        matriculado: true,
    });

    console.log(`Estudiante "${nombre}" agregado correctamente.`);
}

async function buscarEstudianteMenu(estudiantes: Estudiante[]): Promise<void> {
    const nombreBuscar = await pedirRespuesta("¿Qué nombre buscas?: ");
    const encontrado = buscarEstudianteNombre(estudiantes, nombreBuscar);

    if (encontrado) {
        console.log(
            `Encontrado: ${encontrado.nombre}, Promedio: ${encontrado.promedio}, ${aprobo(encontrado)}`
        );
    } else {
        console.log("Estudiante no registrado.");
    }
}

function verAprobadosMenu(estudiantes: Estudiante[]): void {
    const aprobados = obtenerAprobados(estudiantes);
    if (aprobados.length === 0) {
        console.log("No hay estudiantes aprobados todavía.");
        return;
    }
    console.log("--- Estudiantes aprobados ---");
    aprobados.forEach((nombre) => console.log(`- ${nombre}`));
}

function verPromedioGeneralMenu(estudiantes: Estudiante[]): void {
    const promedio = promedioGeneral(estudiantes);
    console.log(`Promedio general del curso: ${promedio.toFixed(2)}`);
}

// ==========================================
// BUCLE PRINCIPAL DEL MENÚ
// ==========================================
async function main(): Promise<void> {
    let salir = false;

    // Bucle controlado por una variable booleana en vez de "while(true)" con
    // un "break" perdido en medio del switch — es más fácil de leer y de
    // seguir el flujo de salida.
    while (!salir) {
        mostrarMenu();
        const opcion = await pedirRespuesta("Elige una opción: ");

        switch (opcion.trim()) {
            case "1":
                verEstudiantes(estudiantes);
                break;
            case "2":
                await agregarEstudiante(estudiantes);
                break;
            case "3":
                await buscarEstudianteMenu(estudiantes);
                break;
            case "4":
                verAprobadosMenu(estudiantes);
                break;
            case "5":
                verPromedioGeneralMenu(estudiantes);
                break;
            case "6":
                console.log("¡Hasta luego!");
                salir = true;
                break;
            default:
                console.log("Opción inválida. Intenta de nuevo.");
        }
    }

    rl.close();
}

main();
