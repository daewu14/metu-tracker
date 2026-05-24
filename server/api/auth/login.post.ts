export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;
  
  const config = useRuntimeConfig();
  const authUsersStr = config.authUsers;
  
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' });
  }

  try {
    const users = JSON.parse(authUsersStr as string);
    const validUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (validUser) {
      // Basic secure cookie (in production consider signing this with authSecret)
      setCookie(event, 'auth_token', 'authenticated_' + username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      return { success: true, message: 'Logged in successfully', user: { username } };
    }
  } catch(e) {
    console.error("Auth parsing error", e);
  }

  throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
});
