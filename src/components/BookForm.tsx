import { useState, useEffect, useRef } from 'react';
import { type CreateBookRequest, type Book, BOOK_CATEGORIES } from '../types';
import { ImagePlus } from 'lucide-react';
import './BookForm.css';

interface BookFormProps {
    onSubmit: (data: CreateBookRequest, imageFile?: File) => Promise<void>;
    onCancel: () => void;
    initialData?: Book;
    isLoading?: boolean;
    submitLabel?: string;
}

const BookForm = ({
    onSubmit, onCancel, initialData, isLoading = false, submitLabel = 'Submit'
}: BookFormProps) => {
    const [form, setForm] = useState<CreateBookRequest>({
        bookName: '', bookAuthor: '', description: '', category: 'Other',
    });
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                bookName: initialData.bookName,
                bookAuthor: initialData.bookAuthor,
                description: initialData.description,
                category: initialData.category,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form, imageFile);
    };

    return (
        <div className="form-card">
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="field">
                        <label>Book Name</label>
                        <input type="text" name="bookName" value={form.bookName}
                            onChange={handleChange} placeholder="Enter book title" required />
                    </div>
                    <div className="field">
                        <label>Author</label>
                        <input type="text" name="bookAuthor" value={form.bookAuthor}
                            onChange={handleChange} placeholder="Author name" required />
                    </div>
                </div>

                <div className="field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                        {BOOK_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Description</label>
                    <textarea name="description" value={form.description}
                        onChange={handleChange} placeholder="Short description..." />
                </div>

                <div className="field">
                    <label>Cover Image</label>
                    <div className="image-upload" onClick={() => fileInputRef.current?.click()}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                        ) : (
                            <div className="image-placeholder">
                                <ImagePlus size={28} strokeWidth={1.5} />
                                <p>Click to upload image</p>
                                <small>JPG, PNG, WEBP — max 5MB</small>
                            </div>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange} style={{ display: 'none' }} />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookForm;