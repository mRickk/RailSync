import { createRouter, createWebHistory } from 'vue-router';
import { isTokenValid } from '@/api/auth';

import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Signup from '@/views/Signup.vue';
import Reservations from '@/views/Reservations.vue';
import Profile from '@/views/Profile.vue';
import UserManagement from '@/views/UserManagement.vue';
import ReservationManagement from '@/views/ReservationManagement.vue';
import Booking from '@/views/Booking.vue';

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
    {
        path: '/profile',
        name: "Profile",
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: "Profile",
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/users',
        name: "UserManagement",
        component: UserManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/reservations',
        name: "ReservationManagement",
        component: ReservationManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/booking/:solution_id',
        name: "Booking",
        component: Booking,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async(to, from, next) => {
    const authToken = localStorage.getItem('authToken');
    const isTokenAvailable = !!authToken;
    let isAuthenticated = false;

    if (isTokenAvailable) {
        try {
            isAuthenticated = await isTokenValid(authToken);
        } catch (error) {
            console.error('Token validation error:', error);
            isAuthenticated = false;
        }
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        localStorage.clear();
        next('/login');
    } else if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
        next('/home');
    } else {
        next();
    }
});


export default router;