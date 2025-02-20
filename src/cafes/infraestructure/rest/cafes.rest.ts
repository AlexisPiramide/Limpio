import express, { Request, Response } from "express";
import {isAdmin, isAuth} from '../../../../context/security/auth'
import Cafe from "../../domain/Cafe";
import cafeRepository from "../../domain/cafes.repository";
import CafeUsecases from "../../application/cafes.usecases";
import CafeRepositoryMongo from "../db/cafes.repository.mongo";
import Admin from "../../../usuarios-admin/domain/Admin";
import { handleImageUpload } from "../../../../context/image-upload";

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

router.post("/filtrados/:pagina", async (req: Request, res: Response) => {
    /*  
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener cafes filtrados'
    */

    const { nombre, tienda, tueste, origen} = req.body;
    const precioMax = Number(req.body.precioMax);
    const precioMin = Number(req.body.precioMin);
    const peso = Number(req.body.peso)*1000;
    let pagina = Number(req.params.pagina) || 0;
    const porNota: boolean = req.body.porNota;

    console.log(porNota);
    try {
        const cafes: Cafe[] = await cafeusecases.cafesFiltrados(nombre,tienda,tueste,origen,peso,precioMax,precioMin,pagina,porNota);
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

    const {nombre,tueste,imagen,origen,nota} = req.body
    const peso = Number(req.body.peso)*1000;
    const precio = Number(req.body.precio);

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
router.put("/", isAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para modificar un cafe'
    */

    const { nombre, tueste, imagen, origen, nota, datoscambiar } = req.body;
    
    const peso = Number(req.body.peso);
    const precio = Number(req.body.precio);

    const cafeOrigen = origen;

    const tienda: Admin = {
        tienda_alias: req.body.tienda_alias,
        tienda_id: req.body.tienda_id
    };
    
    const cafe: Cafe = {
        nombre: nombre,
        tienda: tienda,
        tueste: tueste,
        precio: precio,
        origen: cafeOrigen,
        peso: peso,
        imagen: imagen,
        nota: nota
    };

    if (!datoscambiar) {
        return res.status(400).json({ error: "Datos a cambiar son necesarios" });
    }

    try {
        const result = await cafeusecases.modificarCafe(cafe, datoscambiar);
        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});


router.delete("/",isAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para eliminar un cafe'
    */
    const cafe : Cafe = {
        nombre: req.body.nombre,
        tienda: req.body.tienda,
        tueste: req.body.tueste,
        precio: req.body.precio,
        origen: req.body.origen,
        peso: req.body.peso,
        imagen: req.body.imagen,
        nota: req.body.nota
    };


    try {
        const result = await cafeusecases.eliminarCafe(cafe);
        console.log(result);
        res.json(result);
    } catch (error) {
        
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.post("/total/cafes/tienda",isAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener cafes de una tienda'
    */

    const tienda = req.body.tienda_alias;
    const pagina = Number(req.body.pagina);

    try {
        const cafes: Cafe[] = await cafeusecases.getCafesTienda(tienda,pagina);
        res.json(cafes);
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {

            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.get("/total/cafes/tienda/paginas",isAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener paginas de cafes de una tienda'
    */

    const tienda = req.body.tienda_alias;

    try {
        const paginas = await cafeusecases.getPaginasTienda(tienda);
        res.json(paginas);
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {

            res.status(500).json({ error: "An unknown error occurred" });
        }
    }


});

router.post("/imagen",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para subir una imagen'
    */
    const { imagen, alias } = req.body;

    try {
        const uniqueName = handleImageUpload(imagen, alias);
        res.json({ uniqueName });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});


router.get("/total/cafes/paginas",async (req: Request, res: Response) => {

    try {
        const paginas = await cafeusecases.getPaginas();
        res.json(paginas);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.post("/total/cafes/paginas/filtradas",async (req: Request, res: Response) => {
    
    const { nombre, tienda, tueste, origen} = req.body;

    const precioMax = Number(req.body.precioMax);
    const precioMin = Number(req.body.precioMin);
    const peso = Number(req.body.peso)*1000;

    const porNota: boolean = req.body.porNota;
    try {
        const paginas = await cafeusecases.getPaginasFiltradas(nombre,tienda,tueste,origen,peso,precioMax,precioMin,porNota);
        res.json(paginas);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});


router.get("/c/c/c/tipos",async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Cafes']
    * #swagger.description = 'Endpoint para obtener los tipos de cafe'
    */

    try {
        const tipos = await cafeusecases.getTipos();
        res.json(tipos);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

export default router;