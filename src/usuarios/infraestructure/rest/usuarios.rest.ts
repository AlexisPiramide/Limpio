import express, { Request, Response } from "express";
import { isAuth, isAdmin, rejectAdmin } from "../../../../context/security/auth";
import usuarioRepository from "../../domain/usuarios.repository";
import UsuarioRepositoryMongo from "../db/usuarios.repository.mongo";
import UsuarioUsecases from "../../application/usuarios.usecases";
import Usuario from "../../domain/Usuario";
import Cafe from "../../../cafes/domain/Cafe";
import Admin from "../../../usuarios-admin/domain/Admin";

import { handleResponseSesiones, handleResponseCestas } from "./../../domain/usuarios.helpers";
import Imagen from "../../../imagenes/domain/Imagen";
import { handleImageUpload } from "../../../../context/image-upload";

const usuariorepositorypostgres: usuarioRepository = new UsuarioRepositoryMongo();
const usuariousecases = new UsuarioUsecases(usuariorepositorypostgres);
const router = express.Router();



const nuevoUsuarioAPI = (req: Request, isAdminRoute: boolean = false) => {
    const { alias, correo, password, tienda_alias,foto } = req.body;
    if (isAdminRoute) {
        return { alias, correo, password,foto, tienda_alias } as Admin;
    }
    return { alias, correo,foto,password } as Usuario;
};

router.post("/registro", async (req: Request, res: Response) => {
    /*
     * #swagger.tags = ['Usuarios']
     * #swagger.description = 'Endpoint para registrar un usuario'
    */
    try {
        const usuarioAPI = nuevoUsuarioAPI(req);
        const usuario = await usuariousecases.registro(usuarioAPI);
        handleResponseSesiones(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

router.post("/registro/admin", /*isAdmin,*/ async (req: Request, res: Response) => {
    /*
     * #swagger.tags = ['Usuarios']
     * #swagger.description = 'Endpoint para registrar un usuario administrador'
    */
    try {
        const usuarioAPI = nuevoUsuarioAPI(req, true);
        const usuario = await usuariousecases.registro(usuarioAPI); 
        
        handleResponseSesiones(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    /*
     * #swagger.tags = ['Usuarios']
     * #swagger.description = 'Endpoint para loguear un usuario'
    */
    try {
        const usuarioAPI = nuevoUsuarioAPI(req);
        const usuario = await usuariousecases.login(usuarioAPI);
        handleResponseSesiones(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

router.put("/cesta", rejectAdmin, isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Usuarios']
    * #swagger.description = 'Endpoint para añadir un café a la cesta de un usuario'
    */
    try {
        const { alias, correo, password } = req.body;
        const accion: string = req.body.accion;
        const usuarioAPI: Usuario = { alias, correo, password };
        const { nombre, tienda, tueste} = req.body.cafe;
        const tiendaApi: Admin = { tienda_alias: tienda.tienda_alias, tienda_id: tienda.tienda_id };
        const cafeApi: Cafe = { nombre, tienda: tiendaApi, tueste };
        const usuario: Usuario = await usuariousecases.modificarCesta(cafeApi, usuarioAPI, accion);
        handleResponseCestas(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

router.delete("/cesta", rejectAdmin, isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Usuarios']
    * #swagger.description = 'Endpoint para eliminar un café de la cesta de un usuario'
    */

    try {
        const { alias, correo } = req.body;
        const usuarioAPI: Usuario = { alias, correo };
        const { nombre, tienda, tueste, imagen } = req.body.cafe;
        const tiendaApi: Admin = { tienda_alias: tienda.tienda_alias, tienda_id: tienda.tienda_id };
        const cafeApi: Cafe = { nombre, tienda: tiendaApi, tueste, imagen };

        const usuario: Usuario = await usuariousecases.deleteCafeCesta(cafeApi, usuarioAPI);
        handleResponseCestas(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

router.delete("/limpiar", rejectAdmin, isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Usuarios']
    * #swagger.description = 'Endpoint para limpiar la cesta de un usuario'
    */
   
    try {
        const { alias, correo } = req.body;
        const usuarioAPI: Usuario = { alias, correo };
        const usuario = await usuariousecases.borrarCarrito(usuarioAPI);
        handleResponseCestas(res, usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});


router.put("/actualizar", isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Usuarios']
    * #swagger.description = 'Endpoint para actualizar un usuario'
    */
    try {
        const { alias, correo, password } = req.body;
        
        const usuarioAPI: Usuario = { alias, correo, password };
        const datosCambiar: Usuario = req.body.datosCambiar;

        console.log(req.body.datosCambiar)  
        console.log(datosCambiar);
        const usuario = await usuariousecases.updateUsuario(usuarioAPI, datosCambiar);
        console.log(usuario);
        handleResponseCestas(res, usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});


router.post("/imagen",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Usuarios']
    * #swagger.description = 'Endpoint para subir una imagen'
    */
    try {
        const { alias } = req.body;
        const imagen: Imagen = {file:req.body.imagen};
        const nombreImagen = await handleImageUpload(imagen, alias);
        res.status(200).json(nombreImagen);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

export default router;
