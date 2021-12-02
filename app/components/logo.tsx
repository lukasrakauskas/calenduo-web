import { FC } from 'react'

import { Link } from 'remix'

import { CalendarIcon } from '@heroicons/react/outline'
import clsx from 'clsx'

interface Props {
  textColor?: string
  withText?: boolean
}

const Logo: FC<Props> = ({ textColor = 'text-gray-900', withText = true }) => {
  return (
    <Link
      to="/"
      className={clsx(textColor, 'title-font flex items-center font-medium')}
    >
      <CalendarIcon className="w-6 h-6" />
      {withText ? (
        <span className="ml-3 font-logo text-2xl">Calenduo</span>
      ) : null}
    </Link>
  )
}

export default Logo
