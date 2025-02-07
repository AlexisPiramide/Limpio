export function handleImageUpload(file: File | string, alias: string): string {
    if (typeof file !== "string" && !(file instanceof File)) {
        throw new Error("Invalid file input. Must be a File or string path.");
    }
    
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