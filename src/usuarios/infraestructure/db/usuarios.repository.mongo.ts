import { mapUsuario, mapAdmin, updateCesta, eliminarCafeCesta, handleError,tiendaHandler,getUserFromDB } from './../../domain/usuarios.helpers';
import { collections } from '../../../../context/mongo.db';
import Usuario from '../../domain/Usuario';
import UsuarioRepository from '../../domain/usuarios.repository';

import Cafe from '../../../cafes/domain/Cafe';
import Admin from '../../../usuarios-admin/domain/Admin';


export default class UsuariosRepositoryMongo implements UsuarioRepository {
 

    async registro(usuario: Usuario): Promise<Usuario> {
        try {
            const { alias, correo, password, foto } = usuario;
            const cesta: Cafe[] = [];
            const result = await collections.usuarios.insertOne({ alias, correo, password, foto, cesta });
            return mapUsuario(await getUserFromDB(result.insertedId), false);
        } catch (error) {
            handleError(error, "Error al registrar el usuario");
        }
    }

    async registroAdmin(usuario: Admin): Promise<Admin> {
        try {
            const { alias, correo, password, foto, tienda_alias } = usuario;
            if (foto instanceof File) throw new Error("Error al registrar el administrador");
            const result = await tiendaHandler(tienda_alias, alias, foto, correo, password);
            return mapAdmin(await getUserFromDB(result.insertedId));
        } catch (error) {
            handleError(error, "Error al registrar el administrador");
        }
    }

    async login(usuario: Usuario): Promise<Usuario | Admin> {
        try {
            const { correo } = usuario;
            const usuarioDB = await collections.usuarios.findOne({ correo });
            if (!usuarioDB) throw new Error("Usuario/contraseña no es correcto");
            return usuarioDB.tienda_alias ? mapAdmin(usuarioDB) : mapUsuario(usuarioDB, true);
        } catch (error) {
            handleError(error, "Error al iniciar sesión");
        }
    }

    async getUsuario(correo: string): Promise<Usuario> {
        try {
            const usuarioDB = await collections.usuarios.findOne({ correo });
            if (!usuarioDB) throw new Error("Usuario/contraseña no es correcto");
            return mapUsuario(usuarioDB, false);
        } catch (error) {
            handleError(error, "Error al obtener el usuario");
        }
    }

    async updateUsuario(usuario: Usuario, datosCambiar: Usuario): Promise<Usuario> {
        try {
            const { correo } = usuario;
            const usuarioDB = await collections.usuarios.findOneAndUpdate(
                { correo },
                { $set: { alias: datosCambiar.alias, foto: datosCambiar.foto, password: datosCambiar.password } },
                { returnDocument: "after" }
            );
            if (!usuarioDB) throw new Error("Usuario no encontrado");
            return mapUsuario(await getUserFromDB(correo), false);
        } catch (error) {
            handleError(error, "Error al actualizar el usuario");
        }
    }

    async putCesta(cafe: Cafe, usuario: Usuario, accion: string): Promise<Usuario> {
        try {
            const { correo } = usuario;
            const result = await getUserFromDB(correo);
            const updatedCesta = updateCesta(result.cesta, cafe, accion);
            await collections.usuarios.updateOne({ correo }, { $set: { cesta: updatedCesta } });
            return { ...result, cesta: updatedCesta };
        } catch (error) {
            handleError(error, "Error al modificar la cesta");
        }
    }

    async deleteCafeCesta(cafe: Cafe, usuario: Usuario): Promise<Usuario> {
        try {
            const { correo } = usuario;
            const result = await getUserFromDB(correo);
            const updatedCesta = eliminarCafeCesta(result.cesta, cafe);
            await collections.usuarios.updateOne({ correo }, { $set: { cesta: updatedCesta } });
            return { ...result, cesta: updatedCesta };
        } catch (error) {
            handleError(error, "Error al eliminar el café de la cesta");
        }
    }
    async deleteCesta(usuario: Usuario): Promise<Usuario> {
        try {
            const { correo } = usuario;
            await collections.usuarios.updateOne({ correo }, { $set: { cesta: [] } });
            return mapUsuario(await getUserFromDB(correo), false);
        } catch (error) {
            handleError(error, "Error al borrar el carrito");
        }
    }



}
