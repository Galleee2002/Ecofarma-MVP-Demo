const BASE = 'https://apis.datos.gob.ar/georef/api';

async function pedirJson(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error('Georef respondió ' + respuesta.status);
    }
    return respuesta.json();
}

export async function listarProvincias() {
    try {
        const datos = await pedirJson(BASE + '/provincias?campos=nombre&max=30');
        const lista = Array.isArray(datos.provincias) ? datos.provincias : [];
        const opciones = [];

        for (const provincia of lista) {
            if (typeof provincia.nombre !== 'string' || provincia.nombre.trim() === '') {
                continue;
            }
            const nombre = provincia.nombre.trim();
            opciones.push({
                value: nombre,
                label: nombre,
            });
        }

        opciones.sort(function (a, b) {
            return a.label.localeCompare(b.label, 'es');
        });

        return opciones;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function nombresDeLocalidades(lista) {
    const nombres = [];

    for (const localidad of lista) {
        if (typeof localidad.nombre !== 'string' || localidad.nombre.trim() === '') {
            continue;
        }
        const nombre = localidad.nombre.trim();
        if (!nombres.includes(nombre)) {
            nombres.push(nombre);
        }
    }

    nombres.sort(function (a, b) {
        return a.localeCompare(b, 'es');
    });

    return nombres;
}

export async function listarLocalidadesPorProvincia(provincia) {
    const nombreProvincia = String(provincia || '').trim();

    if (nombreProvincia === '') {
        return [];
    }

    try {
        const params = new URLSearchParams({
            provincia: nombreProvincia,
            max: '5000',
            campos: 'nombre',
        });
        const datos = await pedirJson(BASE + '/localidades?' + params.toString());
        const lista = Array.isArray(datos.localidades) ? datos.localidades : [];
        return nombresDeLocalidades(lista);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function buscarLocalidades(provincia, texto) {
    const nombreProvincia = String(provincia || '').trim();
    const nombreLocalidad = String(texto || '').trim();

    if (nombreProvincia === '' || nombreLocalidad === '') {
        return [];
    }

    try {
        const params = new URLSearchParams({
            provincia: nombreProvincia,
            nombre: nombreLocalidad,
            max: '15',
            campos: 'nombre',
        });
        const datos = await pedirJson(BASE + '/localidades?' + params.toString());
        const lista = Array.isArray(datos.localidades) ? datos.localidades : [];
        return nombresDeLocalidades(lista);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function validarLocalidad(provincia, localidad) {
    const nombreProvincia = String(provincia || '').trim();
    const nombreLocalidad = String(localidad || '').trim();

    if (nombreProvincia === '' || nombreLocalidad === '') {
        return false;
    }

    try {
        const params = new URLSearchParams({
            provincia: nombreProvincia,
            nombre: nombreLocalidad,
            exacto: 'true',
            max: '5',
            campos: 'nombre',
        });
        const datos = await pedirJson(BASE + '/localidades?' + params.toString());
        const lista = Array.isArray(datos.localidades) ? datos.localidades : [];

        for (const item of lista) {
            if (typeof item.nombre !== 'string') {
                continue;
            }
            if (item.nombre.trim().toLowerCase() === nombreLocalidad.toLowerCase()) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}
