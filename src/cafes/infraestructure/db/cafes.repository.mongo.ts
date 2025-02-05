import { collections } from '../../../../context/mongo.db';
import Cafe from '../../domain/Cafe';
import cafesRepository from '../../domain/cafes.repository';
import { mapCafe,handleError } from '../../domain/cafes.helpers';
export default class CafesRepositoryMongo implements cafesRepository {
  
    async getCafe(nombre: string, tienda: string, tueste: string): Promise<Cafe> {
        try {
            const cafe = await collections.cafes.findOne({ nombre, tienda, tueste });
            if (!cafe) throw new Error("Café no encontrado");
            return mapCafe(cafe);
        } catch (error) {
            handleError(error, "Error al buscar el café");
        }
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
            if (!result.acknowledged) throw new Error("Error al insertar el café");
            const resultdb = await collections.usuarios.findOne({tienda_alias: cafe.tienda.tienda_alias});
            console.log(resultdb);
            if(resultdb){
                const cafes = resultdb.cafes;
                cafes.push(cafe);
                await collections.usuarios.updateOne({tienda_alias: cafe.tienda.tienda_alias}, { $set: { cafes } });
                return cafe;
            }
          
        } catch (error) {
            handleError(error, "Error al insertar el café");
        }
    }

    async eliminarCafe(cafe: Cafe): Promise<boolean> {
        try {
            const result = await collections.cafes.deleteOne({ nombre: cafe.nombre, tienda: cafe.tienda, tueste: cafe.tueste });
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
            const result = await collections.cafes.updateOne({ nombre: cafe.nombre, tienda: cafe.tienda, tueste: cafe.tueste }, { $set: { nota: cafe.nota } });
            if (!result.acknowledged) throw new Error("Error al modificar la nota del café");
            return cafe;
        } catch (error) {
            handleError(error, "Error al modificar la nota del café");
        }
    }

    async cafesFiltrados(nombre: string, tienda: string, tueste: string,origen:string,precioMax:number,precioMin:number,pagina:number): Promise<Cafe[]>{

        const filtros: any = {
            ...(nombre && { nombre }),
            ...(tienda && { 'tienda.tienda_alias': tienda }),
            ...(tueste && { tueste }),
            ...(origen && { origen }),
            ...(precioMax && { precio: { $lte: precioMax } }),
            ...(precioMin && { precio: { $gte: precioMin } })
        };
    
        const cafesdb = await collections.cafes
            .find(filtros)
            .skip(pagina * 20)
            .limit(20)
            .toArray();
    
        return cafesdb.map(mapCafe);
    }
}

