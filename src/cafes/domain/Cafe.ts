import Admin from "../../usuarios-admin/domain/Admin";

export default interface Cafe {
    nombre: string;
    tienda: Admin;
    tueste: string;
    precio?: number;
    origen?: string;
    peso?: number;
    imagen: string | File;
    nota?: number;
}