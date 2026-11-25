export function mensajeDeValidez(campo) {
    if (campo.validity.customError && campo.validationMessage !== '') {
        return campo.validationMessage;
    }
    if (campo.validity.valueMissing) {
        return 'Completá este campo.';
    }
    if (campo.validity.typeMismatch) {
        return 'Ingresá un email válido.';
    }
    if (campo.validity.tooShort) {
        if (campo.type === 'password') {
            return 'La contraseña debe tener al menos ' + campo.minLength + ' caracteres.';
        }
        return 'Usá al menos ' + campo.minLength + ' caracteres.';
    }
    if (campo.validity.patternMismatch) {
        return 'El formato no es válido.';
    }
    if (campo.validationMessage !== '') {
        return campo.validationMessage;
    }
    return 'Revisá este campo.';
}
