import { apiClient } from '../api/apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authService = {
    register: async (data: RegisterRequest): Promise<void> => {
        await apiClient.post('/auth/register', data);
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return await apiClient.post<LoginResponse>('/auth/login', data);
    },

    logout: (): void => {
        localStorage.removeItem('token');
    },
};