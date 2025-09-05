export async function getCurrentUser() {
    const response = await fetch('/api/user/get-current-user');
    const result = await response.json();

    return result.user;
}
