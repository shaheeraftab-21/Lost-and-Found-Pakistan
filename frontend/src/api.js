// Thin fetch wrapper. Cookies carry the session; the Vite proxy keeps everything same-origin.
async function request(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: 'include', headers: {} }
  if (form) opts.body = form
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch('/api' + path, opts)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload: (p, form) => request(p, { method: 'POST', form }),
}

export const imgUrl = (id) => `/api/images/${id}`
