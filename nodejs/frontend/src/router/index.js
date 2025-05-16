import { createRouter, createWebHistory } from 'vue-router';

import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Signup from '@/views/Signup.vue';
import Reservations from '@/views/Reservations.vue';

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/login', name: "Login", component: Login },
    { path: '/signup', name: "Signup", component: Signup },
    {
        path: '/home',
        name: "Home",
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/reservations',
        name: "Reservations",
        component: Reservations,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
        next('/home');
    } else {
        next();
    }
});


export default router;