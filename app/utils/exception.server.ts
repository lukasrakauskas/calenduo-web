import { Exception } from '~/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getException = (error: any): Exception => {
  if (
    typeof error === 'object' &&
    'error' in error &&
    'statusCode' in error.error &&
    'message' in error.error
  ) {
    return error.error
  }
  throw error
}
