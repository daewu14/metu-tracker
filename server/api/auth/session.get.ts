export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token');
  if (token && token.startsWith('authenticated_')) {
    const username = token.replace('authenticated_', '');
    return { authenticated: true, user: { username } };
  }
  return { authenticated: false };
});
