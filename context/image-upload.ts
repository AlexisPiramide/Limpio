import Imagen from "../src/imagenes/domain/Imagen";

export function handleImageUpload(file: Imagen, alias: string): string {
    console.log(file)
    
    const uniqueName = alias.replace(/\s/g, '') + generateRandomString() + ".png";

    const uploadSuccess = true;
    if (!uploadSuccess) {
        throw new Error("Error uploading the image");
    }

    return uniqueName;
}

export function generateRandomString(): string {
    return (
        Math.floor(Math.random() * 2000 + 1).toString() +
        Math.floor(Math.random() * 984 + 1).toString() +
        Math.floor(Math.random() * 24124 + 1).toString()
    );
}