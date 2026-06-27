const BASE_URL = import.meta.env.VITE_API_URL as string;

function getToken(): string {
  return localStorage.getItem('token') ?? '';
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
  const headers: Record<string, string> = { accept: '*/*' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Unauthorized');
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
