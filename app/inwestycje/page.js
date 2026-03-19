import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApartmentGallery from '@/components/ApartmentGallery';
import { supabase } from '@/lib/supabase';

import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

function normalizeImages(investment) {
    const directImages = Array.isArray(investment.images) ? investment.images : [];
    return directImages.filter((item) => typeof item === 'string' && item.trim().length > 0);
}

async function getInvestments() {
    try {
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching investments:', error);
        return [];
    }
}

export default async function InvestmentsPage() {
    const investments = await getInvestments();

    return (
        <main>
            <Navbar />
            <section className="section container" style={{ paddingTop: '140px' }}>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>Nasze inwestycje</h1>

                <div style={{ display: 'grid', gap: '4rem' }}>
                    {investments.map((inv, index) => (
                        <div key={inv.id} style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '3rem',
                            alignItems: 'center',
                            direction: index % 2 === 1 ? 'rtl' : 'ltr'
                        }}>
                            <div style={{ direction: 'ltr' }}>
                                <ApartmentGallery
                                    images={normalizeImages(inv)}
                                    altBase={inv.name || 'Inwestycja'}
                                    viewerMinHeight={400}
                                    placeholderText="Brak zdjęć dla tej inwestycji."
                                />
                            </div>

                            <div style={{ direction: 'ltr' }}>
                                <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>{inv.name}</h2>
                                <p style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                    Lokalizacja: {inv.location || 'w przygotowaniu'}
                                </p>
                                <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '2rem' }}>
                                    {inv.description}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
                                    <Link href="/kontakt" className="btn">
                                        Zapytaj o szczegóły
                                    </Link>
                                    {inv.visualization_link ? (
                                        <a
                                            href={inv.visualization_link}
                                            className="btn btnOutline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Zobacz wizualizacje
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}

                    {investments.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888' }}>Brak inwestycji do wyświetlenia.</p>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
