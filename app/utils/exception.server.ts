import { isNumber, isObject, isString } from '@tool-belt/type-predicates'

import { Exception } from '~/api'

function hasProp<K extends PropertyKey>(
  data: object,
  prop: K,
): data is Record<K, unknown> {
  return prop in data
}

export const getException = (error: unknown): Exception => {
  if (!isObject(error) || !hasProp(error, 'error')) throw error

  const { error: unkownException } = error

  if (!isObject(unkownException)) throw error

  if (
    !hasProp(unkownException, 'message') ||
    !hasProp(unkownException, 'statusCode')
  )
    throw error

  const { message, statusCode } = unkownException

  if (!isNumber(statusCode) || !isString(message)) throw error

  return { message, statusCode }
}
