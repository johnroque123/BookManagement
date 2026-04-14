import { apiClient } from '../api/apiClient';
import type { Book, BookQueryParams, CreateBookRequest, PagedResponse, UpdateBookRequest } from '../types';

export const bookService = {
    getAll: async (params?: BookQueryParams): Promise<PagedResponse<Book>> => {
        const query = new URLSearchParams();
        if (params?.search)    query.set('search', params.search);
        if (params?.category)  query.set('category', params.category);
        if (params?.sortBy)    query.set('sortBy', params.sortBy);
        if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
        if (params?.page)      query.set('page', params.page.toString());
        if (params?.pageSize)  query.set('pageSize', params.pageSize.toString());

        const qs = query.toString();
        return await apiClient.get<PagedResponse<Book>>(`/books${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: number): Promise<Book> => {
        return await apiClient.get<Book>(`/books/${id}`);
    },

    create: async (data: CreateBookRequest): Promise<Book> => {
        return await apiClient.post<Book>('/books', data, true);
    },

    update: async (id: number, data: UpdateBookRequest): Promise<Book> => {
        return await apiClient.put<Book>(`/books/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/books/${id}`);
    },

    uploadImage: async (id: number, file: File): Promise<Book> => {
        const formData = new FormData();
        formData.append('image', file);
        return await apiClient.postForm<Book>(`/books/${id}/image`, formData);
    },
};