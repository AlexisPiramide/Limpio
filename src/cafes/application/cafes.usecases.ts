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

    async cafesFiltrados(nombre: string, tienda: string, tueste: string, origen: string, precioMax: number, precioMin: number, pagina: number): Promise<Cafe[]>{
        return this.cafesRepository.cafesFiltrados(nombre, tienda, tueste, origen, precioMax, precioMin, pagina);
    }

    async insertarCafe(cafe: Cafe): Promise<Cafe>{

        const nombreArchivo = await handleImageUpload(cafe.imagen,cafe.nombre,);
        if(nombreArchivo){
            cafe.imagen = nombreArchivo;
        }else{
            throw new Error("Error al subir la imagen")
        }

        return this.cafesRepository.insertarCafe(cafe);
    }

    async eliminarCafe(cafe: Cafe): Promise<boolean>{
        return this.cafesRepository.eliminarCafe(cafe);
    }

    async modificarNotaCafe(cafe: Cafe): Promise<Cafe>{
        return this.cafesRepository.modificarNotaCafe(cafe);
    }
}