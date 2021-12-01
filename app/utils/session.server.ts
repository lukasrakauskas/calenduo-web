import { createCookieSessionStorage, redirect } from 'remix'
import { api, LoginDto } from '~/api'

export async function login(loginDto: LoginDto) {
  const {
    data: { accessToken },
  } = await api.auth.login(loginDto)
  return accessToken
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
})

export const { getSession, commitSession, destroySession } = sessionStorage

export function getUserSession(request: Request) {
  return getSession(request.headers.get('Cookie'))
}

export async function getAccessToken(request: Request) {
  const session = await getUserSession(request)
  const accessToken = session.get('accessToken')
  if (!accessToken || typeof accessToken !== 'string') return null
  return accessToken
}

export async function requireAccessToken(request: Request) {
  const session = await getUserSession(request)
  const accessToken = session.get('accessToken')
  if (!accessToken || typeof accessToken !== 'string') throw redirect('/login')
  return accessToken
}

export async function getUser(request: Request) {
  const accessToken = await getAccessToken(request)
  if (typeof accessToken !== 'string') return null

  try {
    const { data: user } = await api.auth.me({
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return user
  } catch {
    throw logout(request)
  }
}

export async function requireUser(request: Request) {
  const user = await getUser(request)
  if (!user) throw redirect('/login')
  return user
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))

  return redirect('/', {
    headers: { 'Set-Cookie': await destroySession(session) },
  })
}

export async function createUserSession(
  accessToken: string,
  redirectTo: string,
) {
  const session = await getSession()
  session.set('accessToken', accessToken)
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}
