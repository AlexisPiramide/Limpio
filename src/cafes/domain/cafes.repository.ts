import Cafe from './Cafe';
export default interface cafesRepository {

    /*Recibir cafes*/
    getCafe(nombre:string, tienda: string, tueste: string): Promise<Cafe>
    getCafes(pagina:number):Promise<Cafe[]>
    cafesFiltrados(nombre: string, tienda: string, tueste: string,origen:string,precioMax:number,precioMin:number,pagina:number): Promise<Cafe[]>

    /*Insertar, eliminar y modificar cafes*/
    insertarCafe(cafe: Cafe): Promise<Cafe>
    eliminarCafe(cafe: Cafe): Promise<boolean>
    modificarNotaCafe(cafe: Cafe): Promise<Cafe>

}