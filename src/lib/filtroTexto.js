export function coincidePorInicio(campo, texto) {
    if (texto === '') {
        return true;
    }

    const valor = campo === null || campo === undefined ? '' : String(campo);
    const partes = valor.toLowerCase().split(/\s+/).filter(Boolean);

    return partes.some(function (parte) {
        return parte.startsWith(texto);
    });
}
