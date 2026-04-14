import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest } from '../types';
import { BookOpen } from 'lucide-react';
import './AuthPage.css';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterRequest>({
        firstName: '', lastName: '', email: '', username: '', password: '',
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setIsLoading(true);
        try {
            await register(form);
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err: any) {
            if (Array.isArray(err?.errors)) setErrors(err.errors);
            else if (err?.message) setErrors([err.message]);
            else setErrors(['Registration failed']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <BookOpen size={36} strokeWidth={1.5} />
                    </div>
                    <h2>Create Account</h2>
                    <p>Start your personal library</p>
                </div>

                {errors.length > 0 && (
                    <div className="error-box">
                        {errors.map((e, i) => <p key={i}>{e}</p>)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field-row">
                        <div className="field">
                            <label>First Name</label>
                            <input type="text" name="firstName" value={form.firstName}
                                onChange={handleChange} placeholder="John" required />
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={form.lastName}
                                onChange={handleChange} placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="field">
                        <label>Username</label>
                        <input type="text" name="username" value={form.username}
                            onChange={handleChange} placeholder="johndoe" required />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password}
                            onChange={handleChange} placeholder="••••••••" required />
                    </div>
                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;