import Usuario from '../../usuarios/domain/Usuario';
import Pedido from './Pedido';
export default interface pedidosRepository {
    getPedidos(usuario: Usuario): Promise<Pedido[]>;
    getPedido(usuario: Usuario,id: string): Promise<Pedido>;

    createPedido(usuario: Usuario): Promise<Pedido>;
}