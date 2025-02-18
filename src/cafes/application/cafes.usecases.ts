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

    async getPaginas(): Promise<number>{
        return this.cafesRepository.getPaginas();
    }

    async getPaginasFiltradas(nombre: string, tienda: string, tueste: string, origen: string,peso:number, precioMax: number, precioMin: number): Promise<number>{
        return this.cafesRepository.getPaginasFiltradas(nombre, tienda, tueste, origen,peso, precioMax, precioMin);
    }

    async getTipos(): Promise<string[]>{
        return this.cafesRepository.getTipos();
    }
}