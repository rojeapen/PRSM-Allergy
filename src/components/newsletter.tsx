import { useState } from 'react';
import './newsletter.css';
import { subscribeNewsletter } from '../api/db';

function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            await subscribeNewsletter(email);
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <section id="newsletter" className="newsletter">
            <div className="newsletter-container">
                <div className="newsletter-content">
                    <h3>Stay Updated</h3>
                    <p>Join our newsletter to get the latest updates on our research, events, and fundraising campaigns.</p>
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="newsletter-input"
                            disabled={status === 'loading'}
                        />
                        <button type="submit" className="btn-secondary" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                    {status === 'success' && <p className="newsletter-success">Thank you for subscribing!</p>}
                    {status === 'error' && <p className="newsletter-error">Something went wrong. Please try again.</p>}
                </div>
            </div>
        </section>
    );
}

export default Newsletter;
