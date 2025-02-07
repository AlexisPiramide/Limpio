import Admin from '../../usuarios-admin/domain/Admin';
export default interface lineaPedido {
    cafe: string;
    tueste: string;
    tienda_id: Admin['tienda_id'];
    tienda_alias: Admin['tienda_alias'];
    cantidad: number;
    precio: number;
}