import Usuario from '../../usuarios/domain/Usuario';
import Pedido from './Pedido';
export default interface pedidosRepository {
    getPedidos(usuario: Usuario): Promise<Pedido[]>;
    getPedido(usuario: Usuario,id: string): Promise<Pedido>;

    createPedido(usuario: Usuario,direccion:string): Promise<Pedido>;
    getPedidosAdmin(tienda:string): Promise<Pedido[]>;
}