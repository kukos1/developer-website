'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../page.module.css';

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
            <div className="container section" style={{ paddingTop: '140px' }}>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>Kontakt</h1>

                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <h2 style={{ color: 'var(--primary)', fontWeight: '800' }}>Skontaktuj się z nami</h2>
                        <div className={styles.contactDetails}>
                            <p style={{ marginBottom: '0.5rem', color: '#111', fontWeight: '700' }}>PAWEŁ SOŁDAŃSKI</p>
                            <p style={{ marginBottom: '0.5rem' }}>ul. Przykładowa 123</p>
                            <p style={{ marginBottom: '1.5rem' }}>00-001 Warszawa</p>

                            <p style={{ marginBottom: '0.5rem' }}><strong>Tel:</strong> +48 123 456 789</p>
                            <p style={{ marginBottom: '1.5rem' }}><strong>Email:</strong> biuro@pawelsoldanski.pl</p>

                            <p style={{ fontSize: '0.9rem', color: '#777', marginTop: '2rem' }}>
                                NIP: 123-456-78-90<br />
                                REGON: 123456789
                            </p>
                        </div>

                        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.804820625983!2d21.01222871579664!3d52.22967567976077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sPa%C5%82ac%20Kultury%20i%20Nauki!5e0!3m2!1spl!2spl!4v1647864321234!5m2!1spl!2spl"
                                width="100%"
                                height="300"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <div className={styles.contactFormCard}>
                        <h3>Napisz do nas</h3>
                        {submitted ? (
                            <div style={{ padding: '1.5rem', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', border: '1px solid #c8e6c9', fontWeight: '600' }}>
                                ✨ Dziękujemy za wiadomość! Skontaktujemy się z Tobą wkrótce.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Imię i Nazwisko"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Adres Email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Twoja wiadomość..."
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                ></textarea>
                                <button type="submit" className="btn shimmer" style={{ width: '100%' }}>Wyślij Wiadomość</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
