import CafeCesta from './../../cafes-cesta/domain/cafesCesta';

export default interface Usuario {
    id?: string;
    alias?: string;
    correo?: string;
    foto?: File | string;
    password?: string;
    cesta?: CafeCesta[];
}