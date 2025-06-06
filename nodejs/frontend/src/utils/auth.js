import router from '@/router';

export async function logout() {
    localStorage.clear();
    router.push('/login');
}