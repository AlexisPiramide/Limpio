import Cafe from '../../cafes/domain/Cafe';
import Usuario from '../../usuarios/domain/Usuario';
import Nota from './Nota';
export default interface notasRepository {
    
    /*Recibir valoraciones*/
    getValoraciones(usuario:Usuario): Promise<Nota[]>;
    getCafesSinValorar(usuario: Usuario): Promise<Cafe[]>;

    /*Insertar y modificar valoraciones*/
    valorar(cafe: Cafe, usuario: Usuario,nota:number): Promise<Nota>
    modificarValoracion(comprobarNota: any,nota:number): Promise<Nota>;

    /*Modificar total en cafe*/
    modificarTotal(cafe:Cafe): Promise<Cafe>;
}