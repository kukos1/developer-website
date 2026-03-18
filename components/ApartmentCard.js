'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import styles from './ApartmentCard.module.css';

const STATUS_TEXT = {
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

function normalizeImages(apartment) {
    const directImages = Array.isArray(apartment.images) ? apartment.images : [];
    const fallbackImage = apartment.image_url || apartment.imageUrl;

    if (directImages.length > 0) {
        return directImages.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }

    return fallbackImage ? [fallbackImage] : [];
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

export default function ApartmentCard({
    apartment,
    detailsHref = '',
    expandable = false
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const images = useMemo(() => normalizeImages(apartment), [apartment]);
    const hasMultipleImages = images.length > 1;

    const rooms = toNumber(apartment.rooms);
    const area = toNumber(apartment.area);
    const floor = toNumber(apartment.floor);

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const toggleExpanded = () => setIsExpanded((prev) => !prev);

    return (
        <article className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}>
            <div className={styles.imageContainer}>
                {images.length > 0 ? (
                    <Image
                        src={images[currentIndex]}
                        alt={apartment.name || 'Mieszkanie'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.apartmentImage}
                        priority={currentIndex === 0}
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        Wizualizacja mieszkania
                    </div>
                )}

                {hasMultipleImages && (
                    <>
                        <button type="button" className={`${styles.sliderBtn} ${styles.prevBtn}`} onClick={prevImage} aria-label="Poprzednie zdjecie">
                            &lt;
                        </button>
                        <button type="button" className={`${styles.sliderBtn} ${styles.nextBtn}`} onClick={nextImage} aria-label="Nastepne zdjecie">
                            &gt;
                        </button>
                        <div className={styles.imageCounter}>
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.content}>
                <div className={`${styles.status} ${STATUS_CLASS[apartment.status] || ''}`}>
                    {STATUS_TEXT[apartment.status] || 'Nieznany status'}
                </div>

                <h3 className={styles.title}>{apartment.name || 'Mieszkanie'}</h3>

                <div className={styles.details}>
                    <span>{rooms != null ? `${rooms} pok.` : 'Brak danych'}</span>
                    <span>{area != null ? `${area} m2` : 'Brak metrazu'}</span>
                    <span>{floor != null ? `Pietro ${floor}` : 'Pietro ?'}</span>
                </div>

                <div className={styles.price}>{formatPrice(apartment.price)}</div>

                <p className={`${styles.description} ${isExpanded ? styles.descriptionExpanded : ''}`}>
                    {apartment.description || 'Opis mieszkania bedzie dostepny wkrotce.'}
                </p>

                <div className={styles.actionRow}>
                    {expandable && (
                        <button type="button" className={styles.expandBtn} onClick={toggleExpanded}>
                            {isExpanded ? 'Zwin opis' : 'Rozwin opis'}
                        </button>
                    )}
                    {detailsHref && (
                        <Link href={detailsHref} className={styles.detailsLink}>
                            Przejdz do podstrony
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
