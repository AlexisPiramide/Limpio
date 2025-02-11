import Cafe from '../domain/Cafe';
import CafeRepository from '../domain/cafes.repository';

import { handleImageUpload} from "./../../../context/image-upload";
export default class CafesUsecases {
    constructor(private cafesRepository: CafeRepository) {}

    async getCafes(pagina:number):Promise<Cafe[]>{
        return this.cafesRepository.getCafes(pagina);
    }

    async getCafe(nombre: string, tienda: string, tueste: string): Promise<Cafe>{
        return this.cafesRepository.getCafe(nombre,tienda,tueste);
    }

    async cafesFiltrados(nombre: string, tienda: string, tueste: string, origen: string,peso:number, precioMax: number, precioMin: number, pagina: number): Promise<Cafe[]>{
        return this.cafesRepository.cafesFiltrados(nombre, tienda, tueste, origen,peso, precioMax, precioMin, pagina);
    }

    async insertarCafe(cafe: Cafe): Promise<Cafe>{
        const nombreArchivo = handleImageUpload(cafe.imagen,cafe.nombre);
        
        if(!nombreArchivo){
            throw new Error("Error al subir la imagen")
        }

        cafe.imagen = nombreArchivo;

        return this.cafesRepository.insertarCafe(cafe);
    }

    async eliminarCafe(cafe: Cafe): Promise<boolean>{
        return this.cafesRepository.eliminarCafe(cafe);
    }

    async modificarNotaCafe(cafe: Cafe): Promise<Cafe>{
        return this.cafesRepository.modificarNotaCafe(cafe);
    }

    async modificarCafe(cafe: Cafe): Promise<Cafe>{
        return this.cafesRepository.modificarCafe(cafe);
    }

    async getCafesTienda(tienda: string): Promise<Cafe[]>{
        return this.cafesRepository.getCafesTienda(tienda);
    }
}