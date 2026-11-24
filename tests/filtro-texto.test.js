import assert from 'node:assert/strict';
import test from 'node:test';
import { coincidePorInicio } from '../src/lib/filtroTexto.js';

test('coincidePorInicio encuentra varios términos dentro de palabras del medicamento', function () {
    assert.equal(coincidePorInicio('Paracetamol 500 mg', 'paracetamol 500'), true);
});

test('coincidePorInicio requiere que todos los términos de búsqueda coincidan', function () {
    assert.equal(coincidePorInicio('Paracetamol 500 mg', 'paracetamol 750'), false);
});

test('coincidePorInicio conserva la búsqueda por prefijo de una palabra', function () {
    assert.equal(coincidePorInicio('Paracetamol 500 mg', 'para'), true);
});
