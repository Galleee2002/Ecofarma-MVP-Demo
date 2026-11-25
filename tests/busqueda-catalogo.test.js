import assert from 'node:assert/strict';
import test from 'node:test';

const moduloBusqueda = await import('../src/lib/busquedaCatalogo.js').catch(function () {
    return {};
});

test('crearDestinoBusqueda incluye el término recortado en la ruta recibir', function () {
    assert.equal(typeof moduloBusqueda.crearDestinoBusqueda, 'function');
    assert.deepEqual(moduloBusqueda.crearDestinoBusqueda('  ibuprofeno  '), {
        name: 'recibir',
        query: { busqueda: 'ibuprofeno' },
    });
});

test('crearDestinoBusqueda omite el query cuando el término está vacío', function () {
    assert.equal(typeof moduloBusqueda.crearDestinoBusqueda, 'function');
    assert.deepEqual(moduloBusqueda.crearDestinoBusqueda('   '), {
        name: 'recibir',
    });
});

test('crearDestinoBusqueda conserva espacios y caracteres reservados para Vue Router', function () {
    assert.equal(typeof moduloBusqueda.crearDestinoBusqueda, 'function');
    assert.deepEqual(moduloBusqueda.crearDestinoBusqueda('paracetamol & vitamina C'), {
        name: 'recibir',
        query: { busqueda: 'paracetamol & vitamina C' },
    });
});

test('normalizarBusqueda conserva una búsqueda de texto', function () {
    assert.equal(typeof moduloBusqueda.normalizarBusqueda, 'function');
    assert.equal(moduloBusqueda.normalizarBusqueda('paracetamol'), 'paracetamol');
});

test('normalizarBusqueda devuelve texto vacío cuando no hay parámetro', function () {
    assert.equal(typeof moduloBusqueda.normalizarBusqueda, 'function');
    assert.equal(moduloBusqueda.normalizarBusqueda(undefined), '');
});

test('normalizarBusqueda devuelve texto vacío para un parámetro repetido', function () {
    assert.equal(typeof moduloBusqueda.normalizarBusqueda, 'function');
    assert.equal(moduloBusqueda.normalizarBusqueda(['uno', 'dos']), '');
});
