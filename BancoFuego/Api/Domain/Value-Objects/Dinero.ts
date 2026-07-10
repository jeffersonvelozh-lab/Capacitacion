import { ValueObject } from "../../Shared/ValueObjects";
import { Moneda } from "../Enums/Moneda";

interface DineroProps {
    centavos: number;
    moneda: Moneda;
}


export class Dinero extends ValueObject<DineroProps> {
    constructor(props: DineroProps){
            super(props)
    }

    // Aqui se crea un objecto Dinero a partir de un valor decimal
    public static desdeDecimal(
        monto: number,
        moneda: Moneda
    ): Dinero {
        if(!Number.isFinite(monto))
            throw new Error('El monto debe ser un número valido');
        if(monto < 0)
            throw new Error('El monto no puede ser negativo');

        const centavos = Math.round(monto * 100);

        return new Dinero({ centavos, moneda});
    }

    // Aquí se crea un Objeto Dinero desde centavos

    public static desdeCentavos(
        centavos: number,
        moneda: Moneda
    ): Dinero{
        if(!Number.isInteger(centavos))
            throw new Error('Los centavos deben de ser un número enteo')

        if(centavos < 0)
            throw new Error('Los centavos no pueden ser negativos');

        return new Dinero({centavos, moneda});
    }

    get moneda(): Moneda {
        return this.props.moneda;
    }

    get centavos(): number {
        return this.props.centavos;
    }
    
    //Metodo que valida dos decimales
    toDecimal(): number {
        return this.props.centavos / 100;
    }

    //Metodo que valida que se suman el mismo tipo de moneda 
    mismaMoneda(otro: Dinero): boolean {
        return this.moneda === otro.moneda;
    }

    //Metodo que valida que las monedas sean del mismo tipo
    private validarMoneda(otro: Dinero): void {
        if(!(this.moneda === otro.moneda))
            throw new Error('Las monedas deeben de ser iguales');
    }

    //Metodo para sumar dos monedas
    sumar(otro: Dinero ): Dinero {
        this.validarMoneda(otro);

        return Dinero.desdeCentavos(
            this.centavos + otro.centavos, this.moneda
        );
    }

    //Metodo para restar dos monedas
    restar(otro: Dinero ): Dinero {
        this.validarMoneda(otro);

        const resultado = this.centavos - otro.centavos;

        if(resultado < 0) 
            throw new Error("La operacion produce un monto negativo");

        return Dinero.desdeCentavos(
            resultado, this.moneda
        );
    }

    // Metodo para multiplicar
    multiplicar(factor: number): Dinero {

        if (factor < 0)
            throw new Error("El factor no puede ser negativo.");

        return Dinero.desdeCentavos(
            Math.round(this.centavos * factor),
            this.moneda
        );
    }

    dividir(divisor: number): Dinero {

        if (divisor <= 0)
            throw new Error("El divisor debe ser mayor que cero.");

        return Dinero.desdeCentavos(
            Math.round(this.centavos / divisor),
            this.moneda
        );
    }

    porcentaje(valor: number): Dinero {

        if (valor < 0)
            throw new Error("El porcentaje no puede ser negativo.");

        return this.multiplicar(valor / 100);
    }

    esMayorQue(otro: Dinero): boolean {

        this.validarMoneda(otro);

        return this.centavos > otro.centavos;
    }

    esMenorQue(otro: Dinero): boolean {

        this.validarMoneda(otro);

        return this.centavos < otro.centavos;
    }

    esIgual(otro: Dinero): boolean {

        return this.equals(otro);
    }

    esCero(): boolean {

        return this.centavos === 0;
    }

    esPositivo(): boolean {

        return this.centavos > 0;
    }

    toString(): string {

        return `${this.toDecimal().toFixed(2)} ${this.moneda}`;
    }
}