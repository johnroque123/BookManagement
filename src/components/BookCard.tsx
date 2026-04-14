import type { Book } from '../types';
import { getImageUrl } from '../api/apiClient';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import './BookCard.css';

interface BookCardProps {
    book: Book;
    onEdit: (book: Book) => void;
    onDelete: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Fiction: '#7c6af7', NonFiction: '#4caf7d', Science: '#4aa8e0',
    Technology: '#e07c4a', History: '#c4a44a', Biography: '#e05c8a',
    SelfHelp: '#4abfa0', Fantasy: '#9c4ae0', Mystery: '#e0904a',
    Romance: '#e04a7c', Other: '#7a7a8a',
};

const BookCard = ({ book, onEdit, onDelete }: BookCardProps) => {
    const imageUrl = getImageUrl(book.imageUrl);
    const categoryColor = CATEGORY_COLORS[book.category] ?? '#7a7a8a';

    return (
        <div className="book-card">
            {imageUrl ? (
                <img src={imageUrl} alt={book.bookName} className="book-image" />
            ) : (
                <div className="book-image-placeholder">
                    <BookOpen size={24} strokeWidth={1.5} />
                </div>
            )}

            <div className="book-spine" style={{ background: categoryColor }} />

            <div className="book-content">
                <div className="book-top">
                    <div>
                        <h3>{book.bookName}</h3>
                        <p className="book-author">by {book.bookAuthor}</p>
                    </div>
                    <span className="book-category"
                        style={{ color: categoryColor, borderColor: categoryColor }}>
                        {book.category}
                    </span>
                </div>

                {book.description && (
                    <p className="book-description">{book.description}</p>
                )}

                <p className="book-date">
                    {new Date(book.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    })}
                </p>
            </div>

            <div className="book-actions">
                <button className="btn-edit" onClick={() => onEdit(book)}>
                    <Pencil size={13} /> Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(book.id)}>
                    <Trash2 size={13} /> Delete
                </button>
            </div>
        </div>
    );
};

export default BookCard;