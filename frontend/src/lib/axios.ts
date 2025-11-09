import axios from 'axios'
import { getToken, clearToken } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000'
})

// Request interceptor: attach Bearer token and debug log
api.interceptors.request.use((config) => {
  const token = getToken()
  const hasAuth = !!token
  
  // Attach Authorization header if token exists and not already provided
  if (token && !config.headers['Authorization']) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  // Debug log: [API] <METHOD> <full-url> | auth=<true|false>
  // Smoke test: Network tab must show requests with Authorization: Bearer <JWT>
  const method = (config.method || 'GET').toUpperCase()
  const baseURL = config.baseURL || api.defaults.baseURL || ''
  const url = config.url ? `${baseURL}${config.url}` : 'unknown'
  console.log(`[API] ${method} ${url} | auth=${hasAuth}`)
  
  return config
})

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // On 401, clear token and redirect to login
    // Smoke test: 401 → token cleared and redirect to /login
    if (err?.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Optional: Helper for 404 trailing slash resilience
export async function postWithSlashRetry(url: string, data: any, config?: any) {
  try {
    return await api.post(url, data, config)
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const toggled = url.endsWith('/') ? url.slice(0, -1) : url + '/'
      return await api.post(toggled, data, config)
    }
    throw err
  }
}

export default api
