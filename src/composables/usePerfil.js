import { ref } from 'vue';
import { actualizarEmailUsuario, actualizarPerfil, validarDatosPerfil } from '../lib/perfil';
import { useAuth } from './useAuth';

export function usePerfil() {
    const { sesion, perfil } = useAuth();
    const cargando = ref(false);
    const error = ref('');
    const mensaje = ref('');

    async function actualizarDatos(datos) {
        error.value = '';
        mensaje.value = '';

        const validacion = validarDatosPerfil(datos);
        if (!validacion.ok) {
            error.value = validacion.error;
            return false;
        }

        const datosLimpios = validacion.datos;
        cargando.value = true;

        const { data, error: errorUpdate } = await actualizarPerfil(sesion.value.user.id, datosLimpios);

        if (errorUpdate) {
            console.error(errorUpdate);
            cargando.value = false;
            if (errorUpdate.code === '23505') {
                error.value = 'Ya hay una cuenta registrada con ese DNI.';
            } else {
                error.value = 'No pudimos guardar tus datos. Intentá de nuevo en unos minutos.';
            }
            return false;
        }

        perfil.value = data;

        if (datosLimpios.email !== sesion.value.user.email) {
            const { data: datosAuth, error: errorEmail } = await actualizarEmailUsuario(datosLimpios.email);

            if (errorEmail) {
                console.error(errorEmail);
                cargando.value = false;
                if (errorEmail.code === 'email_exists' || errorEmail.code === 'user_already_exists') {
                    error.value = 'Ya existe una cuenta con ese email.';
                } else if (errorEmail.code === 'email_address_invalid') {
                    error.value = 'El email ingresado no es válido.';
                } else {
                    error.value = 'Guardamos el resto de tus datos, pero no pudimos actualizar el email.';
                }
                return false;
            }

            if (datosAuth.user) {
                sesion.value = {
                    ...sesion.value,
                    user: datosAuth.user,
                };
            }

            cargando.value = false;

            if (!datosAuth.user || datosAuth.user.email !== datosLimpios.email) {
                mensaje.value = 'Guardamos tus datos. Confirmá el nuevo email desde el correo que te enviamos para poder usarlo.';
                return true;
            }

            mensaje.value = 'Tus datos se guardaron correctamente.';
            return true;
        }

        cargando.value = false;
        mensaje.value = 'Tus datos se guardaron correctamente.';
        return true;
    }

    return {
        cargando,
        error,
        mensaje,
        actualizarDatos,
    };
}
