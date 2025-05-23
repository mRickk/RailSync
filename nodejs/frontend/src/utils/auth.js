import router from '@/router';

export async function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('id');
    router.push('/login');
}