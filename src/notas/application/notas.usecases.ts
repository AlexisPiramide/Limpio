import Cafe from '../../cafes/domain/Cafe';
import { collections } from '../../../context/mongo.db';
import Usuario from '../../usuarios/domain/Usuario';
import Nota from '../domain/Nota';
import NotaRepository from '../domain/notas.helpers';

export default class NotasUsecases {
    constructor(private notasRepository: NotaRepository) {}

    async getValoraciones(usuario: Usuario): Promise<Nota[]> {
        return this.notasRepository.getValoraciones(usuario);
    }

    async getCafesSinValorar(usuario: Usuario): Promise<Cafe[]> {
        return this.notasRepository.getCafesSinValorar(usuario);
    }

    async valorarNota(cafe: Cafe, usuario: Usuario, nota: number): Promise<Nota> {
        return this.comprobarNota(cafe, usuario, nota);
    }
    
    private async comprobarNota(cafe: Cafe, usuario: Usuario, nota: number): Promise<Nota> {

        const comprobarSiExiste = await collections.cafes.findOne({
            nombre: cafe.nombre,
            "tienda.tienda_alias": cafe.tienda.tienda_alias,
            tueste: cafe.tueste,
            peso: cafe.peso,
            precio: cafe.precio,
        });
      
        if(!comprobarSiExiste){
            throw new Error("El café no existe");
        }

        const comprobarNota = {
            "usuario.correo": usuario.correo,
            "cafe.nombre": cafe.nombre,
            "cafe.tienda.tienda_alias": cafe.tienda.tienda_alias,
            "cafe.tueste": cafe.tueste,
            "cafe.precio": cafe.precio,
            "cafe.peso": cafe.peso,
        };

        const comprobacion = await collections.notas.findOne(comprobarNota);

        if (comprobacion) {
            
            const notaModificada =  await this.notasRepository.modificarValoracion(comprobarNota, nota);

            const result = await this.notasRepository.modificarTotal(cafe);
            if(result){return notaModificada;}else{throw new Error("Error al modificar la nota total")}

        } else {
          
            const notaNueva = await  this.notasRepository.valorar(cafe, usuario, nota);

            const result = await  this.notasRepository.modificarTotal(cafe);
            if(result){return notaNueva;}else{throw new Error("Error al modificar la nota total")}
        }
    }

    
}
