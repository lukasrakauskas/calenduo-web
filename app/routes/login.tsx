import { useEffect } from 'react'

import { Form, useActionData, useTransition, Link } from 'remix'
import type { MetaFunction, ActionFunction } from 'remix'

import { LockClosedIcon } from '@heroicons/react/solid'
import { motion, useAnimation } from 'framer-motion'

import Logo from '~/components/logo'
import { createUserSession, login } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return { title: 'Login | Calenduo', description: 'Login to Calenduo' }
}

function validateEmail(email: unknown) {
  if (typeof email !== 'string' || email.length < 3) {
    return `Email must be at least 3 characters long`
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`
  }
}

type LoginForm = {
  email: string
  password: string
}

type ActionData = {
  error?: string
  fields?: LoginForm
}

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const { email, password } = Object.fromEntries(await request.formData())
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: `Form not submitted correctly.` }
  }

  const fields = { email, password }

  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError, fields }
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError, fields }
  }

  const accessToken = await login({ email, password })

  if (!accessToken) {
    return {
      fields,
      error: `Username/Password combination is incorrect`,
    }
  }

  return createUserSession(accessToken, '/dashboard')
}

export default function Login() {
  const transition = useTransition()
  const actionData = useActionData<ActionData>()
  const controls = useAnimation()

  const hasError = !!actionData?.error

  useEffect(() => {
    if (hasError) {
      controls.start(
        {
          x: [0, -10, 10, -10, 0],
        },
        { duration: 0.3 },
      )
    }
  }, [controls, hasError])

  return (
    <div className="flex items-center justify-center px-4 py-12 min-h-full sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-gray-900 text-3xl font-extrabold">
            Log in to your account
          </h2>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="placeholder-gray-500 relative focus:z-10 block px-3 py-2 w-full text-gray-900 border border-gray-300 focus:border-indigo-500 rounded-none rounded-t-md focus:outline-none appearance-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                defaultValue={actionData?.fields?.email}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="placeholder-gray-500 relative focus:z-10 block px-3 py-2 w-full text-gray-900 border border-gray-300 focus:border-indigo-500 rounded-b-md rounded-none focus:outline-none appearance-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="block ml-2 text-gray-900 text-sm"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="hover:text-indigo-500 text-indigo-600 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <motion.button
              animate={controls}
              type="submit"
              className="group relative flex justify-center px-4 py-2 w-full text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={transition.state === 'submitting'}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon
                  className="w-5 h-5 group-hover:text-indigo-400 text-indigo-500"
                  aria-hidden="true"
                />
              </span>
              {transition.state === 'submitting' ? 'Logging in...' : 'Log in'}
            </motion.button>
          </div>

          {!!actionData?.error && (
            <div className="mt-4 text-center text-red-600 text-sm">
              {actionData.error}
            </div>
          )}
        </Form>
      </div>
    </div>
  )
}
