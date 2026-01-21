import { useState } from 'react';
import './newsletter.css';

function Newsletter() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            setEmail('');
            setTimeout(() => setSubmitted(false), 3000);
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
                        />
                        <button type="submit" className="btn-secondary">
                            Subscribe
                        </button>
                    </form>
                    {submitted && <p className="newsletter-success">Thank you for subscribing!</p>}
                </div>
            </div>
        </section>
    );
}

export default Newsletter;
