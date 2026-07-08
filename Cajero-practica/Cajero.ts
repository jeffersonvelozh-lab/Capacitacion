import EventEmitter = require ("events");
class Cajero extends EventEmitter {
  private saldo: number;

  constructor(saldo: number) {
    super();
    this.saldo = saldo;
  }

  public getSaldo(): number {
    return this.saldo;
  }

  public depositar(cantidad: number): void {
    this.saldo += cantidad;
  }

  public retirar(cantidad: number): boolean {
    if (this.saldo >= cantidad) {
      this.saldo -= cantidad;
      return true;
    }
    return false;
  }
}