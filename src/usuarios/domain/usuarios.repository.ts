import Cafe from '../../cafes/domain/Cafe';
import Admin from '../../usuarios-admin/domain/Admin';
import Usuario from './Usuario';

export default interface usuariosRepository {

    /* Inicios de sesión y registros */
    
    login(usuario: Usuario): Promise<Usuario | Admin>;

    registro(usuario: Usuario): Promise<Usuario>;
    registroAdmin(usuario: Admin): Promise<Admin>;

    /* Operaciones Cesta */
    putCesta(cafe: Cafe, usuario:Usuario,accion:string): Promise<Usuario> 
    deleteCafeCesta(cafe: Cafe, usuario:Usuario): Promise<Usuario>
    deleteCesta(usuario:Usuario): Promise<Usuario>

    /*Otros*/
    getUsuario(correo : string): Promise<Usuario>;
    updateUsuario(usuario: Usuario, datosCambiar: Usuario): Promise<Usuario>;
}