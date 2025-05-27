import router from '@/router';

export async function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('id');
    localStorage.removeItem('is_admin');
    router.push('/login');
}