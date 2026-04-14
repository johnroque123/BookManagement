export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7001';
const BASE_URL = `${API_BASE}/api`;
const getToken = (): string | null => localStorage.getItem('token');

const buildHeaders = (isAuth: boolean): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (isAuth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An unexpected error occurred',
        }));
        throw error;
    }

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json() as Promise<T>;
    }

    return undefined as T;
};

export const apiClient = {
    get: async <T>(endpoint: string, isAuth = true): Promise<T> => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: buildHeaders(isAuth),
        });
        return handleResponse<T>(response);
    },

    post: async <T>(endpoint: string, body: unknown, isAuth = false): Promise<T> => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: buildHeaders(isAuth),
            body: JSON.stringify(body),
        });
        return handleResponse<T>(response);
    },

    put: async <T>(endpoint: string, body: unknown, isAuth = true): Promise<T> => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: buildHeaders(isAuth),
            body: JSON.stringify(body),
        });
        return handleResponse<T>(response);
    },

    delete: async <T>(endpoint: string, isAuth = true): Promise<T> => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: buildHeaders(isAuth),
        });
        return handleResponse<T>(response);
    },

    // Special handler for FormData (image upload)
    postForm: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const token = getToken();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        return handleResponse<T>(response);
    },
};

export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl) return null;
    return `${API_BASE}${imageUrl}`;
};