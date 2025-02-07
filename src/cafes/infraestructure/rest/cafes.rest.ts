import express, { Request, Response } from "express";
import {isAdmin, isAuth} from '../../../../context/security/auth'
import Cafe from "../../domain/Cafe";
import cafeRepository from "../../domain/cafes.repository";
import CafeUsecases from "../../application/cafes.usecases";
import CafeRepositoryMongo from "../db/cafes.repository.mongo";
import Admin from "../../../usuarios-admin/domain/Admin";

const caferepositorypostgres: cafeRepository = new CafeRepositoryMongo();
const cafeusecases = new CafeUsecases(caferepositorypostgres);

const router = express.Router();

router.get("/:pagina", async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener todos los cafes'
    */

    const pagina: number = Number(req.params.pagina);

    try {
        const cafes: Cafe[] = await cafeusecases.getCafes(pagina);
        res.json(cafes);
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {

            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.get("/filtrados/:pagina", async (req: Request, res: Response) => {
    /*  
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener cafes filtrados'
    */

    const { nombre, tienda, tueste, origen,peso, precioMax, precioMin } = req.body;
    
    let pagina = Number(req.params.pagina) || 0;
    try {
        const cafes: Cafe[] = await cafeusecases.cafesFiltrados(nombre,tienda,tueste,origen,peso,precioMax,precioMin,pagina);
        res.json(cafes);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});



router.post("/",isAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para añadir un cafe'
    */

    const {nombre,tueste,precio,imagen,peso,origen} = req.body
    
    const tienda: Admin = {
        tienda_alias: req.body.tienda_alias,
        tienda_id: req.body.tienda_id
    }
    
    const cafe : Cafe = {
        nombre: nombre,
        tienda: tienda,
        tueste: tueste,
        precio: precio,
        origen: origen,
        peso: peso,
        imagen: imagen,
        nota: 0
    };

    try {
        const result = await cafeusecases.insertarCafe(cafe);
        res.json(result);
    } catch (error) {
        
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
})

router.delete("/",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para eliminar un cafe'
    */

    const cafe : Cafe = req.body;

    try {
        const result = await cafeusecases.eliminarCafe(cafe);
        res.json(result);
    } catch (error) {
        
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});



export default router;