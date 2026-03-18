import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfferCatalog from '@/components/OfferCatalog';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value) {
    if (value == null) return '-';
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0
    }).format(value);
}

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
    const availableCount = apartments.filter((item) => item.status === 'available').length;
    const reservedCount = apartments.filter((item) => item.status === 'reserved').length;
    const averagePrice = (() => {
        const prices = apartments.map((item) => toNumber(item.price)).filter((value) => value != null);
        if (prices.length === 0) return null;
        return prices.reduce((sum, value) => sum + value, 0) / prices.length;
    })();

    return (
        <main>
            <Navbar />
            <section className={`container section ${styles.pageShell}`}>
                <h1 className={styles.title}>Pelna oferta mieszkan</h1>
                <p className={styles.subtitle}>
                    Wybierz mieszkanie po parametrach, rozwin opis na karcie i przejdz do dedykowanej podstrony lokalu.
                </p>

                <div className={styles.quickStats}>
                    <article className={styles.statCard}>
                        <span>Liczba mieszkan</span>
                        <strong>{apartments.length}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span>Dostepne teraz</span>
                        <strong>{availableCount}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span>Zarezerwowane</span>
                        <strong>{reservedCount}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span>Srednia cena</span>
                        <strong>{formatPrice(averagePrice)}</strong>
                    </article>
                </div>

                <OfferCatalog apartments={apartments} />
            </section>
            <Footer />
        </main>
    );
}
