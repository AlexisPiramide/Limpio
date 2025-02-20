import Cafe from './Cafe';
export default interface cafesRepository {

    /*Recibir cafes*/
    getCafe(nombre:string, tienda: string, tueste: string): Promise<Cafe>
    getCafes(pagina:number):Promise<Cafe[]>
    cafesFiltrados(nombre: string, tienda: string, tueste: string,origen:string,peso:number,precioMax:number,precioMin:number,pagina:number,porNota:boolean): Promise<Cafe[]>
    getCafesTienda(tienda: string,pagina:Number): Promise<Cafe[]>
    /*Insertar, eliminar y modificar cafes*/
    insertarCafe(cafe: Cafe): Promise<Cafe>
    eliminarCafe(cafe: Cafe): Promise<boolean>
    modificarNotaCafe(cafe: Cafe): Promise<Cafe>
    modificarCafe(cafe: Cafe, datoscambiar: any): Promise<Cafe>
    
    getPaginas(): Promise<number>
    getPaginasFiltradas(nombre: string, tienda: string, tueste: string, origen: string,peso:number, precioMax: number, precioMin: number,porNota:boolean): Promise<number>
    getTipos(): Promise<string[]>
    getPaginasTienda(tienda: string): Promise<number>
}