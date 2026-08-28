/** Fetch a protected same-origin API using the HttpOnly session cookie. */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: 'same-origin' })
}
