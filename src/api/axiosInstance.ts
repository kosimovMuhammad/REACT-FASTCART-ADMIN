const BASE_URL = import.meta.env.VITE_API_URL as string;

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp as number | undefined;
    return !!exp && Date.now() / 1000 > exp;
  } catch {
    return true;
  }
}

function clearSessionAndRedirect() {
  localStorage.clear();
  window.location.href = '/login';
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false,
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    if (qs) url += `?${qs}`;
  }

  const token = getToken();

  // Redirect to login before even making the request if the token is already expired
  if (token && isTokenExpired(token)) {
    clearSessionAndRedirect();
    throw new Error('Session expired. Please log in again.');
  }

  const headers: Record<string, string> = { accept: '*/*' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearSessionAndRedirect();
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    // Some APIs return 403 for expired tokens instead of 401 — handle both cases
    const currentToken = getToken();
    if (!currentToken || isTokenExpired(currentToken)) {
      clearSessionAndRedirect();
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let errData: Record<string, unknown> = {};
    try { errData = JSON.parse(errText); } catch { /* not json */ }
    console.error(`[API ${res.status}] ${method} ${path}`, errText);
    const msg = errData.message ?? errData.title ?? errData.errors ?? `HTTP Error ${res.status}`;
    throw new Error(Array.isArray(msg) ? (msg as string[]).join(' | ') : String(msg));
  }

  return res.json() as Promise<T>;
}

const axiosInstance = {
  get<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('GET', path, undefined, false, params);
  },
  post<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('POST', path, body, false, params);
  },
  postForm<T>(path: string, body: FormData, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('POST', path, body, true, params);
  },
  put<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('PUT', path, body, false, params);
  },
  putForm<T>(path: string, body: FormData, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('PUT', path, body, true, params);
  },
  delete<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return apiRequest<T>('DELETE', path, undefined, false, params);
  },
};

export default axiosInstance;
