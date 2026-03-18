import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

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
                            gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                            gap: '3rem',
                            alignItems: 'center',
                            direction: index % 2 === 1 ? 'rtl' : 'ltr'
                        }}>
                            <div style={{ direction: 'ltr', position: 'relative', height: '400px', width: '100%' }}>
                                {inv.images && inv.images.length > 0 ? (
                                    <Image
                                        src={inv.images[0]}
                                        alt={inv.name}
                                        fill
                                        style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        width: '100%',
                                        background: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        color: '#999'
                                    }}>
                                        Brak zdjecia
                                    </div>
                                )}
                            </div>

                            <div style={{ direction: 'ltr' }}>
                                <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>{inv.name}</h2>
                                <p style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                    Lokalizacja: {inv.location || 'w przygotowaniu'}
                                </p>
                                <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '2rem' }}>
                                    {inv.description}
                                </p>
                                <Link href="/kontakt" className="btn">
                                    Zapytaj o szczegoly
                                </Link>
                            </div>
                        </div>
                    ))}

                    {investments.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888' }}>Brak inwestycji do wyswietlenia.</p>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
