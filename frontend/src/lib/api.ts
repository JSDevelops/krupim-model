import { localData } from './localData'

/** Fetch a protected same-origin API using the current Local PostgreSQL session. */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session }, error } = await localData.auth.getSession()
  if (error || !session?.access_token) {
    throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}
