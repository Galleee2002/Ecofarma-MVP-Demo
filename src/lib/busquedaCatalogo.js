export function crearDestinoBusqueda(termino) {
    const busqueda = typeof termino === 'string' ? termino.trim() : '';

    if (busqueda === '') {
        return { name: 'recibir' };
    }

    return {
        name: 'recibir',
        query: { busqueda },
    };
}

export function normalizarBusqueda(query) {
    return typeof query === 'string' ? query : '';
}
