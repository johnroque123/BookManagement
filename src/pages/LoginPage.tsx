import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types';
import { BookOpen } from 'lucide-react';
import './AuthPage.css';

const parseLockoutMinutes = (msg: string): number | null => {
    const match = msg.match(/(\d+)\s+minute/i);
    return match ? parseInt(match[1], 10) : null;
};

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const justVerified = location.state?.verified === true;

    const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
    const [emailAlertSent, setEmailAlertSent] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (lockoutSeconds === null || lockoutSeconds <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (lockoutSeconds === 0) setLockoutSeconds(null);
            return;
        }
        timerRef.current = setInterval(() => {
            setLockoutSeconds(s => (s !== null ? s - 1 : null));
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [lockoutSeconds]);

    const formatCountdown = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lockoutSeconds !== null) return;
        setErrors([]);
        setEmailAlertSent(false);
        setIsLoading(true);
        try {
            await login(form);
            navigate('/books');
        } catch (err: any) {
            const messages: string[] = Array.isArray(err)
                ? err
                : err?.message
                ? [err.message]
                : ['Invalid credentials'];

            const lockoutMsg = messages.find(m =>
                m.toLowerCase().includes('locked') || m.toLowerCase().includes('too many')
            );

            if (lockoutMsg) {
                const minutes = parseLockoutMinutes(lockoutMsg);
                if (minutes !== null) {
                    setLockoutSeconds(minutes * 60);
                    setEmailAlertSent(lockoutMsg.toLowerCase().includes('too many'));
                }
            }

            setErrors(messages);
        } finally {
            setIsLoading(false);
        }
    };

    const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <BookOpen size={36} strokeWidth={1.5} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your library</p>
                </div>

                {justVerified && !isLocked && errors.length === 0 && (
                    <div className="success-box">
                        <p>Email verified! You can now sign in.</p>
                    </div>
                )}

                {isLocked && (
                    <div className="lockout-box">
                        <p className="lockout-countdown">{formatCountdown(lockoutSeconds!)}</p>
                        <p className="lockout-label">
                            {emailAlertSent
                                ? 'Too many failed attempts. A security alert has been sent to your email.'
                                : 'Account is temporarily locked. Try again when the timer reaches 0.'}
                        </p>
                    </div>
                )}

                {!isLocked && errors.length > 0 && (
                    <div className="error-box">
                        {errors.map((e, i) => <p key={i}>{e}</p>)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="johndoe"
                            required
                            disabled={isLocked}
                        />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            disabled={isLocked}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={isLoading || isLocked}
                    >
                        {isLocked
                            ? 'Account locked'
                            : isLoading
                            ? 'Signing in...'
                            : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    No account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;