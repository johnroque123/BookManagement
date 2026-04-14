export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface AuthUser {
    userId: string;
    email: string;
    username: string;
}

export const BOOK_CATEGORIES = [
    'Fiction', 'NonFiction', 'Science', 'Technology',
    'History', 'Biography', 'SelfHelp', 'Fantasy',
    'Mystery', 'Romance', 'Other'
] as const;

export type BookCategory = typeof BOOK_CATEGORIES[number];

export interface Book {
    id: number;
    bookName: string;
    bookAuthor: string;
    description: string;
    category: string;
    imageUrl: string | null;
    createdAt: string;
}

export interface CreateBookRequest {
    bookName: string;
    bookAuthor: string;
    description: string;
    category: string;
}

export interface UpdateBookRequest {
    bookName: string;
    bookAuthor: string;
    description: string;
    category: string;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface BookQueryParams {
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
}

export interface ApiError {
    message: string;
    errors?: string[];
}