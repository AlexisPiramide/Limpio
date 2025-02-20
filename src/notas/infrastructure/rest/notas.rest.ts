import express, { Request, Response } from "express";
import notaRepository from "../../domain/notas.helpers";
import {isAuth} from "../../../../context/security/auth"

import NotaRepositoryMongo from "./../db/notas.repository.mongo";
import NotaUsecases from "./../../application/notas.usecases";
import Usuario from "../../../usuarios/domain/Usuario";
import Nota from "../../domain/Nota";
import Cafe from "../../../cafes/domain/Cafe";
import Admin from "../../../usuarios-admin/domain/Admin";

const notarepositorypostgres: notaRepository = new NotaRepositoryMongo();
const notausecases = new NotaUsecases(notarepositorypostgres);

const router = express.Router();


router.get("/valorables",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Notas']
    * #swagger.description = 'Endpoint para obtener los cafes valorables de un usuario'
    */

    const { alias,correo } = req.body;
    const usuarioAPI: Usuario = {
        alias,
        correo,
    };

    try{
    
        const notas: Nota[] = await notausecases.getValoraciones(usuarioAPI);
    
        const cafes: Cafe[] = await notausecases.getCafesSinValorar(usuarioAPI);

        res.json({ "notas":notas,"cafes":cafes });
    }
    catch(error){
       console.log(error)
    }
    
});
router.put("/valorar",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Notas']
    * #swagger.description = 'Endpoint para valorar un cafe'
    */
    try {

        const usuarioAPI: Usuario = {
            alias : req.body.alias,
            correo : req.body.correo
        };

        const tienda: Admin = {
            tienda_alias: req.body.cafe.tienda.tienda_alias,
            tienda_id: req.body.cafe.tienda.tienda_id
        }

        const cafeApi: Cafe = {
            nombre : req.body.cafe.nombre,
            tienda : tienda,
            tueste : req.body.cafe.tueste,
            origen: req.body.cafe.origen,
            precio : req.body.cafe.precio,
            peso : req.body.cafe.peso
        };
   
        const notaApi = req.body.nota;

        const nota: Nota = await notausecases.valorarNota(cafeApi,usuarioAPI,notaApi);
        
        res.json({ nota });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/valoradas",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Notas']
    * #swagger.description = 'Endpoint para obtener las valoraciones de un usuario'
    */
    try {
        const { alias,correo } = req.body;
        const usuarioAPI: Usuario = {
            alias,
            correo,
        };

        const notas: Nota[] = await notausecases.getValoraciones(usuarioAPI);
        res.json(notas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/sinValorar",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Notas']
    * #swagger.description = 'Endpoint para obtener los cafes que un usuario no ha valorado'
    */
    try {
        const usuarioAPI: Usuario = {
            alias : req.body.alias,
            correo : req.body.correo
        };

        const cafes: Cafe[] = await notausecases.getCafesSinValorar(usuarioAPI);
        res.json(cafes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;