export function obtenerExtension(archivo) {
    if (archivo.type === 'image/png') {
        return 'png';
    }
    if (archivo.type === 'image/webp') {
        return 'webp';
    }
    return 'jpg';
}
