class Cajero {
  private saldo: number;

  constructor(saldo: number) {
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