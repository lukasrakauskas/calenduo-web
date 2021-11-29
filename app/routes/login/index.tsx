import { Form, useActionData, useTransition } from "remix";
import type { MetaFunction, ActionFunction, HeadersFunction } from "remix";
import { LockClosedIcon } from "@heroicons/react/solid";

import Logo from "~/components/logo";
import { createUserSession, login } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return { title: "Login | Calenduo", description: "Login to Calenduo" };
};

export let headers: HeadersFunction = () => {
  return {
    "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${
      60 * 60 * 24 * 30
    }`,
  };
};

function validateEmail(email: unknown) {
  if (typeof email !== "string" || email.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type LoginForm = {
  email: string;
  password: string;
};

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<LoginForm>;
  fields?: LoginForm;
};

export let action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  let { email, password } = Object.fromEntries(await request.formData());
  if (typeof email !== "string" || typeof password !== "string") {
    return { formError: `Form not submitted correctly.` };
  }

  let fields = { email, password };
  let fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

  const accessToken = await login({ email, password });

  if (!accessToken) {
    return {
      fields,
      formError: `Username/Password combination is incorrect`,
    };
  }

  return createUserSession(accessToken, "/dashboard");
};

export default function Login() {
  const transition = useTransition();
  const actionData = useActionData<{ error?: string }>();

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              start your 14-day free trial
            </a>
          </p>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={transition.state === "submitting"}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              {transition.state === "submitting" ? "Logging in..." : "Log in"}
            </button>
          </div>

          {!!actionData?.error && (
            <div className="mt-4 text-sm text-center text-red-600">
              {actionData.error}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
