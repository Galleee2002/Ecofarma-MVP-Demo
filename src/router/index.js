import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const routes = [
    {
        path: '/',
        redirect: '/recibir',
    },
    {
        path: '/recibir',
        name: 'recibir',
        component: () => import('../views/CatalogoView.vue'),
    },
    {
        path: '/catalogo',
        name: 'catalogo',
        component: () => import('../views/CatalogoView.vue'),
    },
    {
        path: '/medicamento/:id',
        name: 'medicamento-detalle',
        component: () => import('../views/MedicamentoDetalleView.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
        meta: { soloInvitados: true },
    },
    {
        path: '/registro',
        name: 'registro',
        component: () => import('../views/RegistroView.vue'),
        meta: { soloInvitados: true },
    },
    {
        path: '/terminos',
        name: 'terminos',
        component: () => import('../views/TerminosView.vue'),
    },
    {
        path: '/declaracion-jurada',
        name: 'declaracion-jurada',
        component: () => import('../views/DeclaracionJuradaView.vue'),
    },
    {
        path: '/perfil',
        name: 'perfil',
        component: () => import('../views/PerfilView.vue'),
        meta: { requiereSesion: true },
    },
    {
        path: '/donar',
        name: 'donar',
        component: () => import('../views/DonarView.vue'),
        meta: { requiereSesion: true },
    },
    {
        path: '/solicitud/:solicitudId/chat',
        name: 'chat-solicitud',
        component: () => import('../views/ChatView.vue'),
        meta: { requiereSesion: true },
    },
    {
        path: '/admin',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiereSesion: true, requiereAdmin: true },
        children: [
            {
                path: '',
                redirect: { name: 'admin-donaciones' },
            },
            {
                path: 'donaciones',
                name: 'admin-donaciones',
                component: () => import('../views/AdminDonacionesView.vue'),
            },
            {
                path: 'vademecum',
                name: 'admin-vademecum',
                component: () => import('../views/AdminVademecumView.vue'),
            },
            {
                path: 'usuarios',
                name: 'admin-usuarios',
                component: () => import('../views/AdminUsuariosView.vue'),
            },
        ],
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        if (to.hash) {
            return { el: to.hash, top: 32 };
        }
        return { top: 0 };
    },
});

router.beforeEach(async function (to) {
    const { sesion, perfil, errorPerfil, esperarSesionInicial, esperarPerfil, mostrarAviso } = useAuth();
    await esperarSesionInicial();

    if (to.meta.requiereSesion && sesion.value === null) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.soloInvitados && sesion.value !== null) {
        return { name: 'catalogo' };
    }

    if (to.meta.requiereAdmin) {
        await esperarPerfil();

        if (errorPerfil.value !== '') {
            return { name: 'catalogo' };
        }

        if (perfil.value === null || perfil.value.rol !== 'admin') {
            mostrarAviso('Esta sección es solo para administradores.', 'advertencia');
            return { name: 'catalogo' };
        }
    }
});
