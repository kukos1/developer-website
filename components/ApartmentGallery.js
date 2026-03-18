'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './ApartmentGallery.module.css';

function prepareImages(images) {
    if (!Array.isArray(images)) return [];
    return images.filter((image) => typeof image === 'string' && image.trim().length > 0);
}

export default function ApartmentGallery({ images, altBase }) {
    const preparedImages = useMemo(() => prepareImages(images), [images]);
    const [activeIndex, setActiveIndex] = useState(0);

    const hasImages = preparedImages.length > 0;
    const hasMultipleImages = preparedImages.length > 1;

    if (!hasImages) {
        return (
            <div className={styles.placeholder}>
                Brak zdjęć dla tego mieszkania.
            </div>
        );
    }

    const showPrevious = () => {
        setActiveIndex((prev) => (prev === 0 ? preparedImages.length - 1 : prev - 1));
    };

    const showNext = () => {
        setActiveIndex((prev) => (prev === preparedImages.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className={styles.gallery}>
            <div className={styles.viewer}>
                <Image
                    src={preparedImages[activeIndex]}
                    alt={`${altBase || 'Mieszkanie'} - zdjęcie ${activeIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 64vw"
                    className={styles.mainImage}
                    priority={activeIndex === 0}
                />

                {hasMultipleImages && (
                    <>
                        <button type="button" className={`${styles.navButton} ${styles.navPrev}`} onClick={showPrevious} aria-label="Poprzednie zdjęcie">
                            &lt;
                        </button>
                        <button type="button" className={`${styles.navButton} ${styles.navNext}`} onClick={showNext} aria-label="Następne zdjęcie">
                            &gt;
                        </button>
                        <div className={styles.counter}>
                            {activeIndex + 1} / {preparedImages.length}
                        </div>
                    </>
                )}
            </div>

            {hasMultipleImages && (
                <div className={styles.thumbnailRail}>
                    {preparedImages.map((imageUrl, index) => (
                        <button
                            type="button"
                            key={`${imageUrl}-${index}`}
                            className={`${styles.thumbButton} ${index === activeIndex ? styles.thumbButtonActive : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Otwórz zdjęcie ${index + 1}`}
                        >
                            <Image
                                src={imageUrl}
                                alt={`${altBase || 'Mieszkanie'} - miniatura ${index + 1}`}
                                fill
                                sizes="(max-width: 720px) 24vw, 11vw"
                                className={styles.thumbImage}
                            />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
