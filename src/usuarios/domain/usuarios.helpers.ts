import { collections } from './../../../context/mongo.db';
import { ObjectId } from 'mongodb';
import  { Response } from "express";
import { createToken} from "./../../../context/security/auth";
import Usuario from './Usuario';
import Admin from '../../usuarios-admin/domain/Admin';

export function mapUsuario(usuarioDB: any, includePassword: boolean) {
    return {
        alias: usuarioDB.alias,
        correo: usuarioDB.correo,
        foto: usuarioDB.foto,
        cesta: usuarioDB.cesta,
        ...(includePassword && { password: usuarioDB.password }),
    };
}

export function mapAdmin(usuarioDB: any) {
    return {
        alias: usuarioDB.alias,
        correo: usuarioDB.correo,
        foto: usuarioDB.foto,
        tienda_alias: usuarioDB.tienda_alias,
        tienda_id: usuarioDB.tienda_id,
        password: usuarioDB.password,
    };
}

export function updateCesta(cesta: any[], cafe: any, accion: string) {
    const cafedb = cesta.find(c => c.nombre === cafe.nombre && c.tienda.tienda_alias === cafe.tienda.tienda_alias);
    if (cafedb) {
        if (accion === 'añadir') cafedb.cantidad++;
        else if (accion === 'eliminar') cafedb.cantidad > 1 ? cafedb.cantidad-- : cesta.splice(cesta.indexOf(cafedb), 1);
    } else if (accion === 'añadir') {
        cesta.push({ nombre: cafe.nombre, tienda: cafe.tienda, tueste: cafe.tueste, imagen: cafe.imagen, cantidad: 1, precio: cafe.precio, peso: cafe.peso });
    }
    return cesta;
}

export function eliminarCafeCesta(cesta: any[], cafe: any) {
    return cesta.filter(c => !(c.nombre === cafe.nombre && c.tienda.tienda_alias === cafe.tienda.tienda_alias));
}

export function handleError(error: any, message: string): never {
    console.error(message, error);
    throw new Error(message);
}

export async function tiendaHandler(tienda_alias: string, alias: string, foto: string, correo: string, password: string) {
    const tiendaExistente = await collections.usuarios.findOne({ tienda_alias });
    const tienda_id = tiendaExistente ? tiendaExistente.tienda_id : new ObjectId();
    const result = await collections.usuarios.insertOne({ alias, correo, foto, password, tienda_alias, tienda_id, cafes: [] });
    if (!result.acknowledged) throw new Error("Error al registrar el administrador");
    return result;
}

export async function getUserFromDB(identifier: any): Promise<any> {
    const usuarioDB = await collections.usuarios.findOne({ _id: identifier }) || await collections.usuarios.findOne({ correo: identifier });
    if (!usuarioDB) throw new Error("Error al recuperar el usuario");
    return usuarioDB;
}

export const handleResponseSesiones = (res: Response, usuario: Usuario | Admin | null , statusCode: number = 200) => {
    if (usuario === null) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    const token = createToken(usuario);

    if('tienda_alias' in usuario){
        return res.status(statusCode).json({ usuario: {
            alias: usuario.alias,
            correo: usuario.correo,
            foto: usuario.foto,
            tienda_alias: usuario.tienda_alias,
            tienda_id: usuario.tienda_id,
        }, token });
    }else{
        return res.status(statusCode).json({ usuario: {
            alias: usuario.alias,
            correo: usuario.correo,
            foto: usuario.foto,
            cesta: usuario.cesta
        }, token });
    }
 
};

export const handleResponseCestas = (res: Response, usuario: Usuario | Admin, statusCode: number = 200) => {
    if(usuario === null) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    const { password, ...usuarioSinPassword } = usuario;
    return res.status(statusCode).json({ usuario: usuarioSinPassword });
}