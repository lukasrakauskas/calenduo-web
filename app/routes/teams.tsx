import { NavLink, Outlet, useLoaderData } from 'remix'
import type { LoaderFunction } from 'remix'

import clsx from 'clsx'

import { User } from '~/api'
import Footer from '~/components/footer'
import Header from '~/components/header'
import { requireUser } from '~/utils/session.server'

type LoaderData = {
  user: User
}

const navigations: Array<{ label: string; path: string }> = [
  { label: 'Create a team', path: 'new' },
  { label: 'Invites', path: 'invites' },
]

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)

  const data: LoaderData = {
    user,
  }

  return data
}

export default function Teams() {
  const { user } = useLoaderData<LoaderData>() ?? {}

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex flex-1 mx-auto my-4 px-2 max-w-7xl sm:px-6 sm:w-full lg:px-8">
        <div className="w-full">
          <div className="grid gap-x-4 grid-cols-4 py-3">
            <Outlet />
            <aside className="grid-col-1 self-start">
              <div className="w-full bg-white rounded-md focus:outline-none shadow">
                {navigations.map(({ label, path }) => (
                  <NavItem key={path} path={path} label={label} />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
function NavItem({ path, label }: { path: string; label: string }) {
  return (
    <div className="py-1">
      <NavLink
        to={path}
        className={({ isActive }) =>
          clsx(
            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            'block px-4 py-2 text-gray-700 hover:text-gray-900 text-sm hover:bg-gray-200',
          )
        }
      >
        {label}
      </NavLink>
    </div>
  )
}
