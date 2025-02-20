import express, { Request, Response } from "express";
import pedidoRepository from "../../domain/pedidos.repository";
import PedidoRepositoryPostgres from "../db/pedidos.repository.postgres";
import PedidoUsecases from "../../application/pedidos.usecases";
import Usuario from "../../../usuarios/domain/Usuario";
import { isAuth,rejectAdmin } from "../../../../context/security/auth";

const pedidorepositorypostgres: pedidoRepository = new PedidoRepositoryPostgres();
const pedidousecases = new PedidoUsecases(pedidorepositorypostgres);

const router = express.Router();
export default router;


router.get("/",isAuth,rejectAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Pedidos']
    * #swagger.description = 'Endpoint para obtener los pedidos de un usuario'
    */
    const usuario: Usuario = {
        alias: req.body.alias,
        correo: req.body.correo
    };

    try {
        const pedidos = await pedidousecases.getPedidos(usuario);
        res.json(pedidos);
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {

            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.get("/:id",isAuth,rejectAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Pedidos']
    * #swagger.description = 'Endpoint para obtener un pedido de un usuario'
    */
    try {

        const id = req.params.id
        const usuario: Usuario = {
            alias: req.body.alias,
            correo: req.body.correo
        };

        const pedido = await pedidousecases.getPedido(usuario,id);
        res.json(pedido);
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {

            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});

router.post("/tramitar",isAuth,rejectAdmin, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Pedidos']
    * #swagger.description = 'Endpoint para tramitar un pedido'
    */
    try {
        const usuario: Usuario = {
            alias: req.body.alias,
            correo: req.body.correo
        };

        const direccion = req.body.direccion;

        const pedido = await pedidousecases.createPedido(usuario,direccion);
        console.log(pedido,"pedido")
        res.json(pedido);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});


router.get("/admin/pedidos",isAuth, async (req: Request, res: Response) => {
    /*
    * #swagger.tags = ['Pedidos']
    * #swagger.description = 'Endpoint para obtener los cafes que tiene que enviar una tienda'
    */

    const tienda = req.body.tienda_alias;

    try {
        const pedidos = await pedidousecases.getPedidosAdmin(tienda);
        res.json(pedidos);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});
