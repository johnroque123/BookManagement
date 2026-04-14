import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { type Book, type BookQueryParams, type CreateBookRequest, BOOK_CATEGORIES } from '../types';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';
import { BookOpen, BookMarked, LogOut, Plus, X } from 'lucide-react';
import './BooksPage.css';

const PAGE_SIZE = 6;

const BooksPage = () => {
    const { user, logout } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: BookQueryParams = {
                page,
                pageSize: PAGE_SIZE,
                sortBy,
                sortOrder,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(category && { category }),
            };
            const data = await bookService.getAll(params);
            setBooks(data.items);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch {
            setError('Failed to load books');
        } finally {
            setIsLoading(false);
        }
    }, [page, sortBy, sortOrder, debouncedSearch, category]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    const handleCreate = async (data: CreateBookRequest, imageFile?: File) => {
        setIsSubmitting(true);
        try {
            const created = await bookService.create(data);
            if (imageFile) await bookService.uploadImage(created.id, imageFile);
            await fetchBooks();
            setShowForm(false);
        } catch {
            setError('Failed to create book');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: CreateBookRequest, imageFile?: File) => {
        if (!editingBook) return;
        setIsSubmitting(true);
        try {
            await bookService.update(editingBook.id, data);
            if (imageFile) await bookService.uploadImage(editingBook.id, imageFile);
            await fetchBooks();
            setEditingBook(null);
        } catch {
            setError('Failed to update book');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this book?')) return;
        try {
            await bookService.delete(id);
            await fetchBooks();
        } catch {
            setError('Failed to delete book');
        }
    };

    const handleCategoryFilter = (cat: string) => {
        setCategory(prev => prev === cat ? '' : cat);
        setPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [by, order] = e.target.value.split('-');
        setSortBy(by);
        setSortOrder(order);
        setPage(1);
    };

    return (
        <div className="books-wrapper">
            <header className="navbar">
                <div className="navbar-brand">
                    <BookOpen size={20} strokeWidth={1.5} />
                    <span>BookShelf</span>
                </div>
                <div className="navbar-right">
                    <span className="navbar-user">Hello, {user?.username}</span>
                    <button className="btn-logout" onClick={logout}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <main className="books-main">
                <div className="page-header">
                    <div>
                        <h2>My Library</h2>
                        <p>{totalCount} {totalCount === 1 ? 'book' : 'books'} in your collection</p>
                    </div>
                    {!editingBook && (
                        <button className="btn-primary btn-add"
                            onClick={() => setShowForm(!showForm)}>
                            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Book</>}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="error-box" style={{ marginBottom: 20 }}>
                        <p>{error}</p>
                    </div>
                )}

                {showForm && !editingBook && (
                    <BookForm onSubmit={handleCreate} onCancel={() => setShowForm(false)}
                        isLoading={isSubmitting} submitLabel="Add Book" />
                )}

                {editingBook && (
                    <BookForm onSubmit={handleUpdate} onCancel={() => setEditingBook(null)}
                        initialData={editingBook} isLoading={isSubmitting} submitLabel="Update Book" />
                )}

                <div className="controls">
                    <input className="search-input" type="text"
                        placeholder="Search by title or author..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="sort-select" onChange={handleSortChange}
                        value={`${sortBy}-${sortOrder}`}>
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="bookName-asc">Title A–Z</option>
                        <option value="bookName-desc">Title Z–A</option>
                        <option value="bookAuthor-asc">Author A–Z</option>
                        <option value="bookAuthor-desc">Author Z–A</option>
                    </select>
                </div>

                <div className="category-chips">
                    {BOOK_CATEGORIES.map(cat => (
                        <button key={cat}
                            className={`chip ${category === cat ? 'chip-active' : ''}`}
                            onClick={() => handleCategoryFilter(cat)}>
                            {cat}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="empty-state"><p>Loading your library...</p></div>
                ) : books.length === 0 ? (
                    <div className="empty-state">
                        <BookMarked size={48} strokeWidth={1} />
                        <p>No books found</p>
                        <small>
                            {search || category
                                ? 'Try clearing your filters'
                                : 'Add your first book to get started'}
                        </small>
                    </div>
                ) : (
                    <div className="books-grid">
                        {books.map(book => (
                            <BookCard key={book.id} book={book}
                                onEdit={(b) => { setEditingBook(b); setShowForm(false); }}
                                onDelete={handleDelete} />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}>← Prev</button>

                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                                        acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === '...'
                                        ? <span key={`e-${i}`} className="ellipsis">...</span>
                                        : <button key={p}
                                            className={`page-btn ${page === p ? 'page-active' : ''}`}
                                            onClick={() => setPage(p as number)}>{p}
                                          </button>
                                )}
                        </div>

                        <button className="page-btn" disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BooksPage;