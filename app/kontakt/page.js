'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main>
            <Navbar />
            <div className="container section" style={{ paddingTop: '120px' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>Kontakt</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>Skontaktuj się z nami</h2>
                        <div style={{ lineHeight: '1.8', color: '#ccc', marginBottom: '2rem' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>PAWEŁ SOŁDAŃSKI</strong></p>
                            <p style={{ marginBottom: '0.5rem' }}>ul. Przykładowa 123</p>
                            <p style={{ marginBottom: '1.5rem' }}>00-001 Warszawa</p>

                            <p style={{ marginBottom: '0.5rem' }}>Tel: +48 123 456 789</p>
                            <p style={{ marginBottom: '1.5rem' }}>Email: biuro@pawelsoldanski.pl</p>

                            <p style={{ fontSize: '0.9rem', color: '#888' }}>
                                NIP: 123-456-78-90<br />
                                REGON: 123456789
                            </p>
                        </div>

                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.804820625983!2d21.01222871579664!3d52.22967567976077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sPa%C5%82ac%20Kultury%20i%20Nauki!5e0!3m2!1spl!2spl!4v1647864321234!5m2!1spl!2spl"
                                width="100%"
                                height="250"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Napisz do nas</h3>
                        {submitted ? (
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '4px' }}>
                                Dziękujemy za wiadomość! Skontaktujemy się z Tobą wkrótce.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Imię i Nazwisko"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Adres Email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Twoja wiadomość..."
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                                ></textarea>
                                <button type="submit" className="btn">Wyślij Wiadomość</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
