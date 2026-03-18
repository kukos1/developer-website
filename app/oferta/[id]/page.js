import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
    available: 'Dostepne',
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
    const apartment = await getApartmentById(params.id);

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
                    &larr; Wroc do oferty
                </Link>

                <div className={styles.layout}>
                    <div className={styles.mediaColumn}>
                        {images.length > 0 ? (
                            <>
                                <div className={styles.mainImageWrap}>
                                    <Image
                                        src={images[0]}
                                        alt={apartment.name || 'Mieszkanie'}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 52vw"
                                        className={styles.mainImage}
                                        priority
                                    />
                                </div>

                                {images.length > 1 && (
                                    <div className={styles.thumbGrid}>
                                        {images.slice(1, 5).map((imageUrl) => (
                                            <div key={imageUrl} className={styles.thumb}>
                                                <Image
                                                    src={imageUrl}
                                                    alt={apartment.name || 'Dodatkowe zdjecie'}
                                                    fill
                                                    sizes="(max-width: 1024px) 33vw, 15vw"
                                                    className={styles.thumbImage}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.placeholder}>
                                Brak zdjec dla tego mieszkania.
                            </div>
                        )}
                    </div>

                    <aside className={styles.infoCard}>
                        <span className={`${styles.statusBadge} ${STATUS_CLASS[apartment.status] || styles.statusAvailable}`}>
                            {STATUS_LABEL[apartment.status] || 'Dostepne'}
                        </span>
                        <h1 className={styles.title}>{apartment.name || 'Mieszkanie'}</h1>

                        <ul className={styles.specList}>
                            <li>
                                <span>Pokoje</span>
                                <strong>{rooms != null ? rooms : '-'}</strong>
                            </li>
                            <li>
                                <span>Metraz</span>
                                <strong>{area != null ? `${area} m2` : '-'}</strong>
                            </li>
                            <li>
                                <span>Pietro</span>
                                <strong>{floor != null ? floor : '-'}</strong>
                            </li>
                        </ul>

                        <p className={styles.price}>{formatPrice(apartment.price)}</p>

                        <p className={styles.description}>
                            {apartment.description || 'Opis tego mieszkania pojawi sie wkrotce.'}
                        </p>

                        <div className={styles.actions}>
                            <Link href={`/kontakt?mieszkanie=${apartment.id}`} className="btn">
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
