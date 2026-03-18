'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || 'Nie udalo sie wyslac wiadomosci.');
            }

            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setSubmitError(error?.message || 'Nie udalo sie wyslac wiadomosci.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        if (submitted) setSubmitted(false);
        if (submitError) setSubmitError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main>
            <Navbar />
            <div className={`container section ${styles.pt140}`}>
                <h1 className={`${styles.sectionTitle} ${styles.textLeft} ${styles.mb4}`}>Kontakt</h1>

                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactHeading}>Skontaktuj sie z nami</h2>
                        <div className={styles.contactDetails}>
                            <p className={styles.companyName}>PAWEŁ SOŁDAŃSKI</p>
                            <p className={styles.mb05}>Gorzewo 31C</p>
                            <p className={styles.mb15}>09-200 Sierpc</p>

                            <p className={styles.mb05}><strong>Tel:</strong> 884-869-402 / 728-863-971</p>
                            <p className={styles.mb15}><strong>Email:</strong> solbet@wp.pl</p>

                            <p className={`${styles.textSmallGray} ${styles.mt2}`}>
                                NIP: 7761235157
                            </p>
                        </div>

                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://maps.google.com/maps?q=Gorzewo+31C,+09-200+Sierpc&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                className={styles.mapFrame}
                                allowFullScreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <div className={styles.contactFormCard}>
                        <h3>Napisz do nas</h3>
                        {submitted ? (
                            <div className={styles.successMessage}>
                                Dziekujemy za wiadomosc. Skontaktujemy sie z Toba wkrotce.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Imie i nazwisko"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Adres email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Twoja wiadomosc..."
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                ></textarea>
                                {submitError ? (
                                    <p className={styles.errorMessage}>{submitError}</p>
                                ) : null}
                                <button type="submit" disabled={isSubmitting} className={`btn shimmer ${styles.fullWidth}`}>
                                    {isSubmitting ? 'Wysylanie...' : 'Wyslij wiadomosc'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
