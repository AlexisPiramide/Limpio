import lineaPedido from "../../linea-pedido/domain/linea-pedido";
import Usuario from "../../usuarios/domain/Usuario";
export default interface Pedido {
    id?: string;
    fecha: string;
    usuario: Usuario;
    pedido: lineaPedido[];
}