import { Fragment } from 'react'

import { MetaFunction, Link } from 'remix'

import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'

import Logo from '~/components/logo'
import TextLoop from '~/components/text-loop'

export const meta: MetaFunction = () => {
  return {
    title: 'Calenduo',
    description: 'Welcome to Calenduo!',
  }
}

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'Blog', href: '#' },
]

export default function Index() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 lg:w-full lg:max-w-2xl xl:pb-32">
          <svg
            className="absolute inset-y-0 right-0 hidden w-48 h-full text-white transform translate-x-1/2 lg:block"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <Popover>
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav
                className="relative flex items-center justify-between sm:h-10 lg:justify-start"
                aria-label="Global"
              >
                <div className="flex flex-grow flex-shrink-0 items-center lg:flex-grow-0">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <Logo />
                    <div className="flex items-center -mr-2 md:hidden">
                      <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Open main menu</span>
                        <MenuIcon className="w-6 h-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
                  {navigation.map(item => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-500 hover:text-gray-900 font-medium"
                    >
                      {item.name}
                    </a>
                  ))}
                  <Link
                    to="/login"
                    className="hover:text-indigo-500 text-indigo-600 font-medium"
                  >
                    Log in
                  </Link>
                </div>
              </nav>
            </div>

            <Transition
              as={Fragment}
              enter="duration-150 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel
                focus
                className="absolute z-10 inset-x-0 top-0 p-2 transform origin-top-right transition md:hidden"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden ring-1 ring-black ring-opacity-5">
                  <div className="flex items-center justify-between pt-4 px-5">
                    <Logo />
                    <div className="-mr-2">
                      <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Close main menu</span>
                        <XIcon className="w-6 h-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="pb-3 pt-2 px-2 space-y-1">
                    {navigation.map(item => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-gray-700 hover:text-gray-900 text-base font-medium hover:bg-gray-50 rounded-md"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <Link
                    to="/login"
                    className="block px-5 py-3 w-full text-center text-indigo-600 font-medium hover:bg-gray-100 bg-gray-50"
                  >
                    Log in
                  </Link>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          <main className="mt-10 mx-auto px-4 max-w-7xl sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-gray-900 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Find and book a</span>{' '}
                <span className="block text-indigo-600 xl:inline">
                  <TextLoop texts={['photographer', 'designer', 'writer']} />
                </span>{' '}
                <span className="block">in no time</span>
              </h1>
              <div className="mt-5 sm:flex sm:justify-center sm:mt-8 lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/signup"
                    className="flex items-center justify-center px-8 py-3 w-full text-white text-base font-medium bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md md:px-10 md:py-4 md:text-lg"
                  >
                    Get started
                  </Link>
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0">
                  <Link
                    to="/"
                    className="flex items-center justify-center px-8 py-3 w-full text-indigo-700 text-base font-medium bg-indigo-100 hover:bg-indigo-200 border border-transparent rounded-md md:px-10 md:py-4 md:text-lg"
                  >
                    Live demo
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="w-full h-56 object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          alt=""
        />
      </div>
    </div>
  )
}
