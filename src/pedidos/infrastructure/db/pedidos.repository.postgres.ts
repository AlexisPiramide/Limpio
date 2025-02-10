import Usuario from '../../../usuarios/domain/Usuario';
import Pedido from '../../domain/Pedido';
import PedidoRepository from '../../domain/pedidos.repository';
import { collections } from '../../../../context/mongo.db';
import cafeCesta from '../../../cafes-cesta/domain/cafesCesta';
import lineapedido from '../../../linea-pedido/domain/linea-pedido';
import executeQuery from '../../../../context/postgres.connector';

export default class PedidosRepositoryPostgres implements PedidoRepository {
    
    async getPedidos(usuario : Usuario): Promise<Pedido[]> {

        try{
            const query = `
                SELECT pedidos.*, linea_pedido.*
                FROM pedidos
                JOIN linea_pedido ON pedidos.id = linea_pedido.pedido_id
                WHERE pedidos.usuario = '${usuario.correo}'
            `;
            const result = await executeQuery(query);
            if (!result) {
                throw new Error('Error con usuario.');
            }

            const pedidosMap: { [key: string]: Pedido } = {};

            result.forEach((row: any) => {
                if (!pedidosMap[row.pedido_id]) {
                    pedidosMap[row.pedido_id] = {
                        id : row.pedido_id,
                        fecha: row.fecha,
                        usuario: {
                            id: row.usuario,
                            alias: usuario.alias,
                            correo: usuario.correo
                        },
                        pedido: []
                    };
                }

                pedidosMap[row.pedido_id].pedido.push({
                    cafe: row.cafe,
                    tueste: row.tueste,
                    tienda_alias: row.tienda_alias,
                    tienda_id: row.tienda_id,
                    cantidad: row.cantidad,
                    precio: row.precio
                });
            });

            const pedidos: Pedido[] = Object.values(pedidosMap);

            return pedidos;
        }catch(error){
            throw new Error('Error obteniendo pedidos');
        }
    }

    async getPedido(usuario : Usuario, id: string): Promise<Pedido> {
        try {
            const query = `
                SELECT pedidos.*, linea_pedido.*
                FROM pedidos
                JOIN linea_pedido ON pedidos.id = linea_pedido.pedido_id
                WHERE pedidos.usuario = '${usuario.correo}' AND pedidos.id = '${id}'
            `;

            const result : any = await executeQuery(query);

            if (!result || result.length === 0) {
                throw new Error('Pedido no encontrado');
            }

            const pedido: Pedido = {
                id: result[0].pedido_id,
                fecha: result[0].fecha,
                usuario: {
                    id: result[0].usuario,
                    alias: usuario.alias,
                    correo: usuario.correo
                },
                pedido: []
            };

            result.forEach((row: any) => {
                pedido.pedido.push({
                    cafe: row.cafe,
                    tueste: row.tueste,
                    tienda_alias: row.tienda_alias,
                    tienda_id: row.tienda_id,
                    cantidad: row.cantidad,
                    precio: row.precio
                });
            });

            return pedido;
        } catch (error) {
            throw new Error('Error obteniendo pedido');
        }
    }

    async createPedido(usuario: Usuario): Promise<Pedido> {
        try {
            const usuarioDB = await collections.usuarios.findOne({ correo: usuario.correo });
    
            if (!usuarioDB) {
                throw new Error('Usuario no encontrado');
            }
    
            const lineaPedidos:lineapedido[] = await Promise.all(
                usuarioDB.cesta.map(async (cafe: any) => {

                    const cafedb = await collections.cafes.findOne({
                        nombre: cafe.nombre,
                        tueste: cafe.tueste,
                        "tienda.tienda_id": cafe.tienda?.tienda_id,
                        "tienda.tienda_alias": cafe.tienda?.tienda_alias
                    });
            
            
                    if (!cafedb) {
                        throw new Error(`Café no encontrado: ${cafe.nombre}`);
                    }
            
                    return {
                        cafe: cafe.nombre,
                        tueste: cafe.tueste,
                        tienda_alias: cafe.tienda?.tienda_alias,
                        tienda_id: cafe.tienda?.tienda_id,
                        cantidad: cafe.cantidad,
                        precio: cafedb.precio
                    };
                })
            );
            
            const pedido: Pedido = {
                fecha: new Date().toISOString(),
                usuario: {
                    id: usuario.id,
                    alias: usuario.alias,
                    correo: usuario.correo
                },
                pedido: lineaPedidos
            };
    
            const query = `
                INSERT INTO pedidos (fecha, usuario) 
                VALUES ($1, $2) RETURNING id
            `;
            const pedidoResult :any = await executeQuery(query, [pedido.fecha, pedido.usuario.correo]);
    
            if (!pedidoResult || !pedidoResult[0]) {
                throw new Error('Error creando pedido en la base de datos');
            }
    
            const pedidoId = pedidoResult[0].id;
            const values = lineaPedidos.map(lp => [
                pedidoId,
                lp.cafe,
                lp.tueste,
                lp.tienda_alias,
                lp.tienda_id,
                lp.cantidad,
                lp.precio
            ]);
    
            const bulkQuery = `
                INSERT INTO linea_pedido 
                (pedido_id, cafe, tueste, tienda_alias, tienda_id, cantidad, precio) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
    
            for (const value of values) {
                await executeQuery(bulkQuery, value);
            }
            
            const pedidodb : Pedido = {
                id: pedidoId,
                fecha: pedido.fecha,
                usuario: pedido.usuario,
                pedido: lineaPedidos
            };

            return pedidodb;
        } catch (error) {
            throw new Error('Error creando el pedido');
        }
    }
    
}