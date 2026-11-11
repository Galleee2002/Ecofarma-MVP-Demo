function leerEnv(nombre) {
    const valor = import.meta.env[nombre];
    if (typeof valor === 'string' && valor.trim() !== '') {
        return valor.trim();
    }
    if (import.meta.env.PROD) {
        throw new Error(`Falta la variable de entorno ${nombre}`);
    }
    console.warn(`Falta la variable de entorno ${nombre}`);
    return '';
}

export const supabaseUrl = leerEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = leerEnv('VITE_SUPABASE_ANON_KEY');
