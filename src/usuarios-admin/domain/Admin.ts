import Cafe from '../../cafes/domain/Cafe';
import Usuario from './../../usuarios/domain/Usuario';

export default interface Admin extends Omit<Usuario, 'cesta'>{
    tienda_id?: string;
    tienda_alias: string;
}