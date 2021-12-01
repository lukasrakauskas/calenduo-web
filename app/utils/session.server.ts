import { createCookieSessionStorage, redirect } from 'remix';
import { api, LoginDto } from '~/api';

export async function login(loginDto: LoginDto) {
  let {
    data: { accessToken },
  } = await api.auth.login(loginDto);
  return accessToken;
}

// let sessionSecret = process.env.SESSION_SECRET;
// if (!sessionSecret) {
//   throw new Error("SESSION_SECRET must be set");
// }

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'calenduo_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: ['s3cr3t'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export function getUserSession(request: Request) {
  return getSession(request.headers.get('Cookie'));
}

export async function getAccessToken(request: Request) {
  let session = await getUserSession(request);
  let accessToken = session.get('accessToken');
  if (!accessToken || typeof accessToken !== 'string') return null;
  return accessToken;
}

export async function requireAccessToken(request: Request) {
  let session = await getUserSession(request);
  let accessToken = session.get('accessToken');
  if (!accessToken || typeof accessToken !== 'string') throw redirect('/login');
  return accessToken;
}

export async function getUser(request: Request) {
  let accessToken = await getAccessToken(request);
  if (typeof accessToken !== 'string') return null;

  try {
    let { data: user } = await api.auth.me({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function requireUser(request: Request) {
  let user = await getUser(request);
  if (!user) throw redirect('/login');
  return user;
}

export async function logout(request: Request) {
  let session = await getSession(request.headers.get('Cookie'));

  return redirect('/', {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
}

export async function createUserSession(
  accessToken: string,
  redirectTo: string,
) {
  let session = await getSession();
  session.set('accessToken', accessToken);
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}
