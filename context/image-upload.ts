export async function handleImageUpload(file: File | string ,alias: string): Promise<string> {
    const nombreArchivo = alias.replace(/\s/g, '') + this.generateRandomString() + ".png";
    // Simulate image upload logic here (e.g., upload to S3)
    const uploadSuccess = true;

    if (!uploadSuccess) {
        throw new Error("Error al subir la imagen");
    }

    return nombreArchivo;
}

export function generateRandomString(): string {
    return Math.floor(Math.random() * 2000 + 1).toString() +
        Math.floor(Math.random() * 984 + 1).toString() +
        Math.floor(Math.random() * 24124 + 1).toString();
}