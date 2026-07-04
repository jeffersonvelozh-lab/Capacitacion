/**
 * Generador simple de identificadores únicos.
 * No dependemos de crypto.randomUUID() de Node para mantener el proyecto
 * simple y sin necesidad de @types/node.
 */
export function generarId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
