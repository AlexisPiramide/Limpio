import Cafe from '../../../cafes/domain/Cafe';
import { collections } from '../../../../context/mongo.db';

import Usuario from '../../../usuarios/domain/Usuario';
import Nota from '../../domain/Nota';
import NotaRepository from '../../domain/notas.helpers';

import cafeRepository from "../../../cafes/domain/cafes.repository";
import CafesRepositoryMongo from '../../../cafes/infraestructure/db/cafes.repository.mongo';

import CafeUsecases from "../../../cafes/application/cafes.usecases";
import usuariosRepository from '../../../usuarios/domain/usuarios.repository';
import UsuariosRepositoryMongo from '../../../usuarios/infraestructure/db/usuarios.repository.mongo';
import UsuariosUsecases from '../../../usuarios/application/usuarios.usecases';
import Admin from '../../../usuarios-admin/domain/Admin';
import pedidosRepository from '../../../pedidos/domain/pedidos.repository';
import PedidosRepositoryPostgres from '../../../pedidos/infrastructure/db/pedidos.repository.postgres';
import PedidosUsecases from '../../../pedidos/application/pedidos.usecases';

const caferepositoryMongo: cafeRepository = new CafesRepositoryMongo();
const cafeusecases = new CafeUsecases(caferepositoryMongo);

const usuarioRepositoryMongo: usuariosRepository = new UsuariosRepositoryMongo();
const usuariousecases = new UsuariosUsecases(usuarioRepositoryMongo)

const pedidosRepositoryPostgres: pedidosRepository = new PedidosRepositoryPostgres();
const pedidosusecases = new PedidosUsecases(pedidosRepositoryPostgres);

export default class NotasRepositoryMongo implements NotaRepository {

    async getValoraciones(usuario: Usuario): Promise<Nota[]> {
        const result = await collections.notas.find({ usuario: usuario }).toArray();

        if (result.length === 0) {
            return [];
        }
    
        const notas: Nota[] = await Promise.all(result.map(async (nota) => {
            
            return {
                usuario: nota.usuario,
                cafe: nota.cafe,
                nota: nota.nota,
            };
        }));
        return notas;
    }
    
    async valorar(cafe: Cafe, usuario: Usuario, nota: number): Promise<Nota> {

        const usuariopost : Usuario = {
            alias : usuario.alias,
            correo : usuario.correo
        }

        const tienda : Admin = {tienda_alias: cafe.tienda.tienda_alias, tienda_id: cafe.tienda.tienda_id}

        const cafepost : Cafe = {
            nombre: cafe.nombre,
            tienda: tienda,
            tueste: cafe.tueste,
            precio: cafe.precio,
            peso: cafe.peso,
            imagen: cafe.imagen
        }

        const newNota = {
            usuario: usuariopost,
            cafe: cafepost,
            nota: nota
        }; 
    
        const result = await collections.notas.insertOne(newNota);
        if (!result.acknowledged) {
            throw new Error("No se pudo insertar la valoración.");
        }
        
        const resultdb = await collections.notas.findOne(newNota)
        
        if(resultdb){
            const usuariodb : Usuario = {
                alias : resultdb.usuario.alias,
                correo : resultdb.usuario.correo
            }

            const tiendadb : Admin = {
                tienda_alias: resultdb.cafe.tienda.tienda_alias,
                tienda_id: resultdb.cafe.tienda.tienda_id
            }

            const cafedb : Cafe = {
                nombre: resultdb.cafe.nombre,
                tienda: tiendadb,
                tueste: resultdb.cafe.tueste,
                precio: resultdb.cafe.precio,
                peso: resultdb.cafe.peso,
                imagen: resultdb.cafe.imagen
            }
    
            return {
                usuario: usuariodb,
                cafe: cafedb,
                nota: resultdb.nota,
            };

        }else{
            throw new Error("No se pudo insertar la valoración.");
        }
    }
    
    async modificarValoracion(cafe: Cafe, usuario: Usuario, nota: number): Promise<Nota> {
        
        const usuariopost : Usuario = {
            alias : usuario.alias,
            correo : usuario.correo
        }

        const tienda : Admin = {tienda_alias: cafe.tienda.tienda_alias, tienda_id: cafe.tienda.tienda_id}

        const cafepost : Cafe = {
            nombre: cafe.nombre,
            tienda: tienda,
            tueste: cafe.tueste,
            precio: cafe.precio,
            peso: cafe.peso,
            imagen: cafe.imagen
        }
        const updatedRating = await collections.notas.findOneAndUpdate({
            usuario: usuariopost,
            cafe: cafepost
        }, 
        { $set: { nota: nota } },
        { returnDocument: "after" });

        
        if(updatedRating){
            const usuariodb : Usuario = {
                alias : updatedRating.usuario.alias,
                correo : updatedRating.usuario.correo
            }

            const tiendadb : Admin = {
                tienda_alias: updatedRating.cafe.tienda.tienda_alias,
                tienda_id: updatedRating.cafe.tienda.tienda_id
            }

            const cafedb : Cafe = {
                nombre: updatedRating.cafe.nombre,
                tienda: tiendadb,
                tueste: updatedRating.cafe.tueste,
                peso: updatedRating.cafe.peso,
                precio: updatedRating.cafe.precio,
                imagen: updatedRating.cafe.imagen
            }
    

            return {
                usuario: usuariodb,
                cafe: cafedb,
                nota: updatedRating.nota,
            };

        }else{
            throw new Error("No se pudo modificar la nota")
        }
    }

    async modificarTotal(cafe: Cafe): Promise<Cafe> {
        const result = await collections.notas.find({ "cafe.nombre": cafe.nombre }).toArray();

        if (result.length === 0) {
            throw new Error("No hay valoraciones para este café.");
        }

        const notas: number[] = result.map(nota => nota.nota);

        const media = notas.reduce((acc, curr) => acc + curr, 0) / notas.length;

        const tienda: Admin = {
            tienda_alias: cafe.tienda.tienda_alias,
            tienda_id: cafe.tienda.tienda_id
        };

        const updatedCafe: Cafe = {
            nombre: cafe.nombre,
            tienda: tienda,
            tueste: cafe.tueste,
            peso: cafe.peso,
            precio: cafe.precio,
            imagen: cafe.imagen,
            nota: media
        };

        const cafedbfinal = await cafeusecases.modificarNotaCafe(updatedCafe);
        
        return cafedbfinal;
    }

    async getCafesSinValorar(usuario: Usuario): Promise<Cafe[]> {
        // Obtener cafés valorados
        const cafesValorados = new Set(
            (await collections.notas.find({ usuario }).toArray())
                .map(nota => `${nota.cafe.nombre}-${nota.cafe.tienda.tienda_alias}-${nota.cafe.tueste}`)
        );
    
        // Obtener pedidos
        const pedidos = await pedidosusecases.getPedidos(usuario);
        if (pedidos.length === 0) return [];
    
        // Recolectar cafés únicos de los pedidos
        const cafesPedidos = new Map<string, Cafe>();
    
        for (const pedido of pedidos) {
            for (const cafe of pedido.pedido) {
                const clave = `${cafe.cafe}-${cafe.tienda_alias}-${cafe.tueste}`;
                if (!cafesPedidos.has(clave)) {
                    const cafedb = await cafeusecases.getCafe(cafe.cafe, cafe.tienda_alias, cafe.tueste);
                    if (cafedb) cafesPedidos.set(clave, cafedb);
                }
            }
        }
    
        // Filtrar los cafés que ya han sido valorados
        const cafesSinValorar = Array.from(cafesPedidos.values()).filter(cafe => {
            const clave = `${cafe.nombre}-${cafe.tienda.tienda_alias}-${cafe.tueste}`;
            return !cafesValorados.has(clave);
        });
    
        return cafesSinValorar;
    }
    
    
}

