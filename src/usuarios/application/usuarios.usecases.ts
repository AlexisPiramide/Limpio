import Usuario from '../domain/Usuario';
import UsuarioRepository from '../domain/usuarios.repository';
import Admin from '../../usuarios-admin/domain/Admin';
import { compare } from "bcrypt";
import { hash } from "../../../context/security/encrypter";
import Cafe from '../../cafes/domain/Cafe';

import { handleImageUpload} from "./../../../context/image-upload";

export default class UsuariosUsecases {
    constructor(private usuariosRepository: UsuarioRepository) {}

    async registro(usuario: Usuario | Admin): Promise<Usuario | Admin> {
        this.validatePassword(usuario);
        usuario.password = hash(usuario.password);

        if (!usuario.foto) {usuario.foto = "default.png";}

        return 'tienda_alias' in usuario 
            ? this.usuariosRepository.registroAdmin(usuario) 
            : this.usuariosRepository.registro(usuario);
    }

    async login(usuario: Usuario): Promise<Usuario | Admin> {
        this.validatePassword(usuario);
        const usuarioBD = await this.usuariosRepository.login(usuario);
        this.validateUser(usuarioBD);

        const iguales = await compare(usuario.password, String(usuarioBD.password));
        if (iguales) {
            return usuarioBD;
        } else {
            throw new Error("Usuario/contraseña no es correcto");
        }
    }
    
    async getUsuario(correo: string): Promise<Usuario> {
        return this.usuariosRepository.getUsuario(correo);
    }

    async updateUsuario(usuario: Usuario, datosCambiar: Usuario): Promise<Usuario> {
        if (datosCambiar.password) {datosCambiar.password = hash(datosCambiar.password);}
        if(datosCambiar.foto)
        datosCambiar.foto = await handleImageUpload(datosCambiar.foto, `${datosCambiar.alias || usuario.alias}`); 

        return this.usuariosRepository.updateUsuario(usuario, datosCambiar);
    }

    async deleteCafeCesta(cafe: Cafe, usuario: Usuario): Promise<Usuario> {
        return this.usuariosRepository.deleteCafeCesta(cafe, usuario);
    }

    async modificarCesta(cafe: Cafe, usuario: Usuario, accion: string): Promise<Usuario> {
        return this.usuariosRepository.putCesta(cafe, usuario, accion);
    }

    async borrarCarrito(usuario: Usuario): Promise<Usuario> {
        return this.usuariosRepository.deleteCesta(usuario);
    }

    private validatePassword(usuario: Usuario | Admin): void {
        if (!usuario.password) throw new Error("Falta password");
    }

    private validateUser(usuarioBD: any): void {
        if (!usuarioBD) throw new Error("Usuario no encontrado");
    }

   
}
