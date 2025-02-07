import Usuario from '../../usuarios/domain/Usuario'
import Cafe from '../../cafes/domain/Cafe'

export default interface Nota {
    usuario: Usuario | string;
    cafe: Cafe;
    nota: number;
}