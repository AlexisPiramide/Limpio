import { collections } from '../../../../context/mongo.db';
import Cafe from '../../domain/Cafe';
import cafesRepository from '../../domain/cafes.repository';
import { mapCafe,handleError } from '../../domain/cafes.helpers';

export default class CafesRepositoryMongo implements cafesRepository {
    
    async getCafe(nombre: string, tienda: string, tueste: string): Promise<Cafe> {
        try {


            const cafe = await collections.cafes.findOne({ nombre: nombre, "tienda.tienda_alias": tienda, tueste: tueste });
            if (!cafe) throw new Error("Café no encontrado");
            return mapCafe(cafe);
        } catch (error) {
            handleError(error, "Error al buscar el café");
        }
    }

    async getPaginas(): Promise<number> {
        try {
            const cafes = await collections.cafes.countDocuments({});
            return Math.ceil(cafes / 20);
        } catch (error) {
            handleError(error, "Error al buscar los cafés");
        }
    }
    
    async getPaginasFiltradas(nombre: string, tienda: string, tueste: string, origen: string,peso:number, precioMax: number, precioMin: number,porNota:boolean): Promise<number>{
        try{
            const filtros: any = {
                ...(nombre && { nombre }),
                ...(tienda && { 'tienda.tienda_alias': tienda }),
                ...(tueste && { tueste }),
                ...(peso && { peso }),
                ...(origen && { origen }),
                ...(precioMin || precioMax ? { precio: {} } : {}),
              };
              
              if (precioMin) filtros.precio.$gte = precioMin;
              if (precioMax) filtros.precio.$lte = precioMax;
            const cafesdb = await collections.cafes
                .countDocuments(filtros)

            return Math.ceil(cafesdb / 20);

        }catch(error){
            handleError(error, "Error al buscar los cafés");
        }
    }

    async cafesFiltrados(nombre: string, tienda: string, tueste: string, origen: string, peso: number, precioMax: number, precioMin: number, pagina: number, porNota: boolean): Promise<Cafe[]> {
        const filtros: any = {
            ...(nombre && { nombre }),
            ...(tienda && { 'tienda.tienda_alias': tienda }),
            ...(tueste && { tueste }),
            ...(peso && { peso }),
            ...(origen && { origen }),
            ...(precioMin || precioMax ? { precio: {} } : {}),
        };
    
        if (precioMin) filtros.precio.$gte = precioMin;
        if (precioMax) filtros.precio.$lte = precioMax;
    
        const ordenamiento: any = porNota ? { nota: -1 } : {};
    
        const cafesdb = await collections.cafes
            .find(filtros)
            .sort(ordenamiento)
            .skip(pagina * 20)
            .limit(20)
            .toArray();
    
        return cafesdb.map(mapCafe);
    }

    async getCafes(pagina: number): Promise<Cafe[]> {
        try {
            const cafes = await collections.cafes.find({}).skip(pagina * 20).limit(20).toArray();
            return cafes.map(mapCafe);
        } catch (error) {
            handleError(error, "Error al buscar los cafés");
        }
    }

    async insertarCafe(cafe: Cafe): Promise<Cafe> {
        try {
            const result = await collections.cafes.insertOne(cafe);
            
            const cafedb = await collections.cafes.findOne(result.insertedId);
            if (!result.acknowledged) throw new Error("Error al insertar el café");
            return mapCafe(cafedb);
          
        } catch (error) {
            handleError(error, "Error al insertar el café");
        }
    }

    async eliminarCafe(cafe: Cafe): Promise<boolean> {
        try {
            const result = await collections.cafes.deleteOne({ nombre: cafe.nombre,"tienda.tienda_alias" : cafe.tienda.tienda_alias, tueste: cafe.tueste, origen: cafe.origen, peso: cafe.peso, precio: cafe.precio });

            return result.deletedCount > 0;
        } catch (error) {
            handleError(error, "Error al eliminar el café");
        }
    }

    async sumatorioValoraciones(nombre: string, tienda: string, tueste: string): Promise<number> {
        try {
            const [result] = await collections.notas.aggregate([
                { $match: { cafe: nombre, tienda, tueste } },
                { $group: { _id: null, totalRating: { $sum: "$rating" }, count: { $sum: 1 } } }
            ]).toArray();
            return result ? result.totalRating / result.count : 0;
        } catch (error) {
            handleError(error, "Error al calcular la nota del café");
        }
    }

    async modificarNotaCafe(cafe: Cafe): Promise<Cafe> {
        try {
            const result = await collections.cafes.updateOne({ nombre: cafe.nombre, "tienda.tienda_alias": cafe.tienda.tienda_alias, tueste: cafe.tueste }, { $set: { nota: cafe.nota } });
            if (result.modifiedCount === 0) throw new Error("Error al modificar la nota del café");
            return cafe;
        } catch (error) {
            handleError(error, "Error al modificar la nota del café");
        }
    }

   

    async modificarCafe(cafe: Cafe, datoscambiar: any): Promise<Cafe> {
        try {
            // Check if the document exists first
            const existingCafe = await collections.cafes.findOne({
                nombre: cafe.nombre,
                "tienda.tienda_alias": cafe.tienda.tienda_alias,
                tueste: cafe.tueste,
                origen: cafe.origen,
                peso: cafe.peso,
                precio: cafe.precio,
            });
    
            if (!existingCafe) {
                throw new Error("Café no encontrado");
            }
    
        
            const result = await collections.cafes.findOneAndUpdate(
                { nombre: cafe.nombre, "tienda.tienda_alias": cafe.tienda.tienda_alias, tueste: cafe.tueste },
                {
                    $set: {
                        nombre: datoscambiar.nombre,
                        tueste: datoscambiar.tueste,
                        precio: datoscambiar.precio,
                        origen: datoscambiar.origen,
                        peso: datoscambiar.peso,
                        imagen: datoscambiar.imagen
                    }
                }
            );
            
            if (!result) throw new Error("Error al modificar el café");
            
            const notas = await collections.notas.find({ "cafe.nombre": cafe.nombre, "cafe.tienda.tienda_alias": cafe.tienda.tienda_alias, "cafe.tueste":cafe.tueste}).toArray();

            notas.forEach(async cafe => {
                await collections.notas.updateOne({ _id: cafe._id }, { $set: { cafe: { nombre: datoscambiar.nombre, tienda: datoscambiar.tienda, tueste: datoscambiar.tueste, precio: datoscambiar.precio, peso: datoscambiar.peso, imagen: datoscambiar.imagen } } });
            });

            return { ...cafe, ...datoscambiar };
        } catch (error) {
            handleError(error, "Error al modificar el café");
        }
    }
    

    async getCafesTienda(tienda: string,pagina:number): Promise<Cafe[]> {
        try {
            const cafesdb = await collections.cafes.find({ 'tienda.tienda_alias': tienda }).skip(pagina * 20).limit(20).toArray();

            return cafesdb.map(mapCafe);
        } catch (error) {
            handleError(error, "Error al buscar los cafés de la tienda");
        }
    }

    async getTipos(): Promise<string[]> {
        try {
            const cafesdb = await collections.cafes.distinct("tueste");
            return cafesdb;
        }catch (error) {
            handleError(error, "Error al buscar los tipos de café");
        }
    }

    async getPaginasTienda(tienda: string): Promise<number>{
        try {
            const cafes = await collections.cafes.countDocuments({ 'tienda.tienda_alias': tienda });
            return Math.ceil(cafes / 20);
        } catch (error) {
            handleError(error, "Error al buscar los cafés de la tienda");
        }
    }
  
}

