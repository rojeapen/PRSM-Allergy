import { useState } from 'react';
import './contact.css';
import Reveal from './reveal';
import { DEFAULT_COPY } from '../constants';

function Contact({ kicker, title, subtitle }: { kicker?: string; title?: string; subtitle?: string }) {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.message) {
            setSubmitted(true);
            const subject = `Contact Form Submission from ${formData.name}`;
            const body = formData.message;
            window.open(
                `mailto:contact@prsmallergy.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                '_blank',
                'noopener,noreferrer',
            );
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSubmitted(false), 4000);
        }
    };

    return (
        <section id="contact" className="contact section">
            <div className="shell contact-grid">
                <Reveal className="contact-intro">
                    <p className="kicker">{kicker || DEFAULT_COPY.contactKicker}</p>
                    <h2 className="contact-title">{title || DEFAULT_COPY.contactTitle}</h2>
                    <p className="lede">
                        {subtitle || DEFAULT_COPY.contactSubtitle}
                    </p>
                    <a className="contact-email" href="mailto:contact@prsmallergy.org">
                        <span className="contact-email-marker" aria-hidden="true" />
                        contact@prsmallergy.org
                    </a>
                </Reveal>

                <Reveal className="contact-card" delay={90}>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input id="name" name="name" type="text" className="field" value={formData.name} onChange={handleChange} required autoComplete="name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input id="email" name="email" type="email" className="field" value={formData.email} onChange={handleChange} required autoComplete="email" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" className="field" rows={5} value={formData.message} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn-primary btn-block">Send message</button>
                        <p className="contact-status" role="status" aria-live="polite">
                            {submitted && 'Thanks! Your message is on its way.'}
                        </p>
                    </form>
                </Reveal>
            </div>
        </section>
    );
}

export default Contact;
