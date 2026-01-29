import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApartmentCard from '@/components/ApartmentCard';
import { supabase } from '@/lib/supabase';

import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

async function getApartments() {
    try {
        const { data, error } = await supabase
            .from('apartments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching apartments:', error);
        return [];
    }
}

export default async function OfferPage() {
    const apartments = await getApartments();

    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '140px', minHeight: '80vh' }} className="container section">
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>Pełna Oferta</h1>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {apartments.length > 0 ? (
                        apartments.map((apt) => (
                            <ApartmentCard key={apt.id} apartment={apt} />
                        ))
                    ) : (
                        <p>Brak dostępnych mieszkań.</p>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
