// Application/Ports/ICuentaRepository.ts
import { Cuenta } from "../../Domain/Entities/Cuenta";

export interface ICuentaRepository {
    buscarPorId(id: number): Promise<Cuenta | null>;
    guardar(cuenta: Cuenta): Promise<void>;
}