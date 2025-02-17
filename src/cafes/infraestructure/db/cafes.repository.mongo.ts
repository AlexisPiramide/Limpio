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

    async getPaginas(): Promise<number> {
        try {
            const cafes = await collections.cafes.countDocuments({});
            return Math.ceil(cafes / 20);
        } catch (error) {
            handleError(error, "Error al buscar los cafés");
        }
    }
    
    async getPaginasFiltradas(nombre: string, tienda: string, tueste: string, origen: string,peso:number, precioMax: number, precioMin: number): Promise<number>{
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
            const resultdb = await collections.usuarios.findOne({tienda_alias: cafe.tienda.tienda_alias});

            if(resultdb){
                const cafes = resultdb.cafes;
                cafes.push(mapCafe(cafedb));
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

    async cafesFiltrados(nombre: string, tienda: string, tueste: string,origen:string,peso:number,precioMax:number,precioMin:number,pagina:number): Promise<Cafe[]>{
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
            .find(filtros)
            .skip(pagina * 20)
            .limit(20)
            .toArray();
    
        return cafesdb.map(mapCafe);
    }

    async modificarCafe(cafe: Cafe): Promise<Cafe> {
        try {
            const result = await collections.cafes.updateOne({ nombre: cafe.nombre, tienda: cafe.tienda, tueste: cafe.tueste }, { $set: { precio: cafe.precio, origen: cafe.origen, peso: cafe.peso, imagen: cafe.imagen } });
            if (!result.acknowledged) throw new Error("Error al modificar el café");
            return cafe;
        } catch (error) {
            handleError(error, "Error al modificar el café");
        }
    }

    async getCafesTienda(tienda: string): Promise<Cafe[]> {
        try {
            const cafesdb = await collections.cafes.find({ 'tienda.tienda_alias': tienda }).toArray();

            return cafesdb.map(mapCafe);
        } catch (error) {
            handleError(error, "Error al buscar los cafés de la tienda");
        }
    }
}

