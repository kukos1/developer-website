'use client';
import { useState } from 'react';
import styles from './ApartmentCard.module.css';

export default function ApartmentCard({ apartment }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Normalize images: use 'images' array if valid, otherwise fallback to 'imageUrl' as single item array, or empty
    const images = apartment.images && apartment.images.length > 0
        ? apartment.images
        : (apartment.imageUrl ? [apartment.imageUrl] : []);

    const hasMultipleImages = images.length > 1;

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

    const statusClass = {
        available: styles.statusAvailable,
        reserved: styles.statusReserved,
        sold: styles.statusSold,
    };

    const statusText = {
        available: 'Dostępne',
        reserved: 'Zarezerwowane',
        sold: 'Sprzedane',
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(price);
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {images.length > 0 ? (
                    <div
                        className={styles.imagePlaceholder}
                        style={{ background: `url(${images[currentIndex]}) center/cover no-repeat` }}
                    ></div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        Wizualizacja Apartamentu
                    </div>
                )}

                {hasMultipleImages && (
                    <>
                        <button className={`${styles.sliderBtn} ${styles.prevBtn}`} onClick={prevImage} title="Poprzednie">
                            &lt;
                        </button>
                        <button className={`${styles.sliderBtn} ${styles.nextBtn}`} onClick={nextImage} title="Następne">
                            &gt;
                        </button>
                        <div className={styles.imageCounter}>
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.content}>
                <div className={`${styles.status} ${statusClass[apartment.status]}`}>
                    {statusText[apartment.status]}
                </div>
                <h3 className={styles.title}>{apartment.name}</h3>
                <div className={styles.details}>
                    <span>{apartment.rooms} pok.</span>
                    <span>{apartment.area} m²</span>
                    <span>Piętro {apartment.floor}</span>
                </div>
                <div className={styles.price}>{formatPrice(apartment.price)}</div>
                <p className={styles.description}>{apartment.description}</p>
            </div>
        </div>
    );
}
