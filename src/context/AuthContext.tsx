import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    register: (data: RegisterRequest) => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const decodeToken = (token: string): AuthUser => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setUser(decodeToken(storedToken));
        }
        setIsLoading(false);
    }, []);

    const register = async (data: RegisterRequest): Promise<void> => {
        await authService.register(data);
    };

    const login = async (data: LoginRequest): Promise<void> => {
        const response = await authService.login(data);
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(decodeToken(response.token));
    };

    const logout = (): void => {
        authService.logout();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};