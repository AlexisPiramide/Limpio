import Usuario from '../../usuarios/domain/Usuario';
import Pedido from '../domain/Pedido';
import PedidoRepository from '../domain/pedidos.repository';

import UsuarioRepositoryMongo from '../../usuarios/infraestructure/db/usuarios.repository.mongo';
import usuarioRepository from '../../usuarios/domain/usuarios.repository';
import UsuarioUsecases from '../../usuarios/application/usuarios.usecases';

const usuariorepositorypostgres: usuarioRepository = new UsuarioRepositoryMongo();
const usuariousecases = new UsuarioUsecases(usuariorepositorypostgres);


export default class PedidosUsecases {
    constructor(private pedidosRepository: PedidoRepository) {}


    async getPedidos(usuario: Usuario): Promise<Pedido[]> {
        return this.pedidosRepository.getPedidos(usuario);
    }

    async getPedido(usuario: Usuario,id: string): Promise<Pedido> {
        return this.pedidosRepository.getPedido(usuario,id);
    }


    async createPedido(usuario: Usuario): Promise<Pedido> {
        const result = this.pedidosRepository.createPedido(usuario);

        if(!result){throw new Error('Error creando pedido')}
        else{
            const carritoBorrado = usuariousecases.borrarCarrito(usuario);
            
            if(!carritoBorrado){throw new Error('Error borrando carrito')}else{return result}
        }
           
    }
}