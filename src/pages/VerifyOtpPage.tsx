import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { BookOpen } from 'lucide-react';
import './AuthPage.css';

const RESEND_COOLDOWN = 60; // seconds before resend is allowed again

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email: string = location.state?.email ?? '';

    const [code, setCode] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Redirect if accessed without email state
    useEffect(() => {
        if (!email) navigate('/register', { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setResendCooldown(s => s - 1);
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resendCooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setSuccess('');
        setIsLoading(true);
        try {
            await apiClient.post('/auth/verify-otp', { email, code }, false);
            navigate('/login', { state: { verified: true } });
        } catch (err: any) {
            setErrors([err?.message ?? 'Verification failed']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setErrors([]);
        setSuccess('');
        setIsResending(true);
        try {
            await apiClient.post('/auth/resend-otp', { email }, false);
            setSuccess('A new code has been sent to your email.');
            setResendCooldown(RESEND_COOLDOWN);
        } catch (err: any) {
            setErrors([err?.message ?? 'Failed to resend code']);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <BookOpen size={36} strokeWidth={1.5} />
                    </div>
                    <h2>Verify your email</h2>
                    <p>
                        We sent a 6-digit code to<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                {success && (
                    <div className="success-box"><p>{success}</p></div>
                )}

                {errors.length > 0 && (
                    <div className="error-box">
                        {errors.map((e, i) => <p key={i}>{e}</p>)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>Verification code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            maxLength={6}
                            required
                            style={{
                                letterSpacing: '0.35em',
                                fontSize: '22px',
                                textAlign: 'center',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={isLoading || code.length < 6}
                    >
                        {isLoading ? 'Verifying...' : 'Verify email'}
                    </button>
                </form>

                <p className="auth-footer">
                    Didn't receive a code?{' '}
                    {resendCooldown > 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>
                            Resend in {resendCooldown}s
                        </span>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit',
                                textDecoration: 'underline',
                                padding: 0,
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                            }}
                        >
                            {isResending ? 'Sending...' : 'Resend code'}
                        </button>
                    )}
                </p>

                <p className="auth-footer">
                    <Link to="/register">← Back to register</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtpPage;