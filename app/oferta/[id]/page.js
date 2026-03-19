import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import ApartmentGallery from '@/components/ApartmentGallery';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
    available: 'Dostępne',
    reserved: 'Zarezerwowane',
    sold: 'Sprzedane'
};

const STATUS_CLASS = {
    available: styles.statusAvailable,
    reserved: styles.statusReserved,
    sold: styles.statusSold
};

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(price) {
    const value = toNumber(price);
    if (value == null) return 'Cena do ustalenia';
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0
    }).format(value);
}

function normalizeImages(apartment) {
    const directImages = Array.isArray(apartment.images) ? apartment.images : [];
    const fallbackImage = apartment.image_url || apartment.imageUrl;

    if (directImages.length > 0) {
        return directImages.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }

    return fallbackImage ? [fallbackImage] : [];
}

async function getApartmentById(id) {
    try {
        const { data, error } = await supabase
            .from('apartments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching apartment details:', error);
        return null;
    }
}

export default async function ApartmentDetailsPage({ params }) {
    const resolvedParams = await params;
    const apartmentId = resolvedParams?.id;

    if (!apartmentId) {
        notFound();
    }

    const apartment = await getApartmentById(apartmentId);

    if (!apartment) {
        notFound();
    }

    const images = normalizeImages(apartment);
    const rooms = toNumber(apartment.rooms);
    const area = toNumber(apartment.area);
    const floor = toNumber(apartment.floor);

    return (
        <main>
            <Navbar />
            <section className={`container section ${styles.pageShell}`}>
                <Link href="/oferta" className={styles.backLink}>
                    &larr; Wróć do oferty
                </Link>

                <div className={styles.layout}>
                    <div className={styles.mediaColumn}>
                        <ApartmentGallery
                            images={images}
                            altBase={apartment.name || 'Mieszkanie'}
                            placeholderText="Brak zdjęć dla tego mieszkania."
                        />
                    </div>

                    <aside className={styles.infoCard}>
                        <span className={`${styles.statusBadge} ${STATUS_CLASS[apartment.status] || styles.statusAvailable}`}>
                            {STATUS_LABEL[apartment.status] || 'Dostępne'}
                        </span>
                        <h1 className={styles.title}>{apartment.name || 'Mieszkanie'}</h1>

                        <ul className={styles.specList}>
                            <li>
                                <span>Pokoje</span>
                                <strong>{rooms != null ? rooms : '-'}</strong>
                            </li>
                            <li>
                                <span>Metraż</span>
                                <strong>{area != null ? `${area} m²` : '-'}</strong>
                            </li>
                            <li>
                                <span>Piętro</span>
                                <strong>{floor != null ? floor : '-'}</strong>
                            </li>
                        </ul>

                        <p className={styles.price}>{formatPrice(apartment.price)}</p>

                        <div className={styles.descriptionCard}>
                            <h2>Opis mieszkania</h2>
                            <p className={styles.description}>
                                {apartment.description || 'Opis tego mieszkania pojawi się wkrótce.'}
                            </p>
                        </div>

                        <div className={styles.actions}>
                            <Link href={`/kontakt?mieszkanie=${apartmentId}`} className="btn">
                                Zapytaj o to mieszkanie
                            </Link>
                            <Link href="/oferta" className="btn btnOutline">
                                Zobacz inne mieszkania
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
            <Footer />
        </main>
    );
}
