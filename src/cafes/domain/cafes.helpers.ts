import Cafe from "./Cafe";

export function mapCafe(cafe: any): Cafe {
    return {
        nombre: cafe.nombre,
        tienda: cafe.tienda,
        tueste: cafe.tueste,
        precio: cafe.precio,
        origen: cafe.origen,
        peso: cafe.peso,
        imagen: cafe.imagen,
        nota: cafe.nota
    };
}

export function handleError(error: any, message: string): never {
    console.error(message, error);
    throw new Error(message);
}