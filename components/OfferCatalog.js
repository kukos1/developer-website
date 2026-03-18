'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ApartmentCard from './ApartmentCard';
import styles from './OfferCatalog.module.css';

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(value) {
    if (value === 'available' || value === 'reserved' || value === 'sold') {
        return value;
    }
    return 'available';
}

function compareByDateDesc(a, b) {
    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return bDate - aDate;
}

function sortApartments(items, sortKey) {
    const sorted = [...items];

    switch (sortKey) {
        case 'priceAsc':
            return sorted.sort((a, b) => (toNumber(a.price) ?? Number.MAX_SAFE_INTEGER) - (toNumber(b.price) ?? Number.MAX_SAFE_INTEGER));
        case 'priceDesc':
            return sorted.sort((a, b) => (toNumber(b.price) ?? 0) - (toNumber(a.price) ?? 0));
        case 'areaDesc':
            return sorted.sort((a, b) => (toNumber(b.area) ?? 0) - (toNumber(a.area) ?? 0));
        case 'roomsDesc':
            return sorted.sort((a, b) => (toNumber(b.rooms) ?? 0) - (toNumber(a.rooms) ?? 0));
        case 'nameAsc':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pl'));
        case 'newest':
        default:
            return sorted.sort(compareByDateDesc);
    }
}

export default function OfferCatalog({ apartments }) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [roomsMin, setRoomsMin] = useState('0');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const preparedApartments = useMemo(() => {
        return (apartments || []).map((item) => ({
            ...item,
            status: normalizeStatus(item.status)
        }));
    }, [apartments]);

    const filteredApartments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const roomsMinValue = Number(roomsMin) || 0;
        const priceMaxValue = priceMax ? Number(priceMax) : null;

        const filtered = preparedApartments.filter((apartment) => {
            const matchesQuery =
                !normalizedQuery ||
                (apartment.name || '').toLowerCase().includes(normalizedQuery) ||
                (apartment.description || '').toLowerCase().includes(normalizedQuery);

            const matchesStatus = status === 'all' || apartment.status === status;

            const rooms = toNumber(apartment.rooms) ?? 0;
            const matchesRooms = rooms >= roomsMinValue;

            const price = toNumber(apartment.price);
            const matchesPrice = priceMaxValue == null || (price != null && price <= priceMaxValue);

            return matchesQuery && matchesStatus && matchesRooms && matchesPrice;
        });

        return sortApartments(filtered, sortBy);
    }, [preparedApartments, query, status, roomsMin, priceMax, sortBy]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <label className={styles.field}>
                        <span>Szukaj</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="np. Mieszkanie A1"
                        />
                    </label>

                    <label className={styles.field}>
                        <span>Status</span>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="all">Wszystkie</option>
                            <option value="available">Dostępne</option>
                            <option value="reserved">Zarezerwowane</option>
                            <option value="sold">Sprzedane</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span>Min. liczba pokoi</span>
                        <select value={roomsMin} onChange={(e) => setRoomsMin(e.target.value)}>
                            <option value="0">Bez limitu</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span>Maks. cena (PLN)</span>
                        <input
                            type="number"
                            min="0"
                            step="10000"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            placeholder="np. 700000"
                        />
                    </label>

                    <label className={styles.field}>
                        <span>Sortowanie</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Najnowsze</option>
                            <option value="priceAsc">Cena rosnąco</option>
                            <option value="priceDesc">Cena malejąco</option>
                            <option value="areaDesc">Największy metraż</option>
                            <option value="roomsDesc">Najwięcej pokoi</option>
                            <option value="nameAsc">Nazwa A-Z</option>
                        </select>
                    </label>
                </div>

                <p className={styles.resultInfo}>
                    Pokazano {filteredApartments.length} z {preparedApartments.length} mieszkań.
                </p>
            </div>

            {filteredApartments.length > 0 ? (
                <div className={styles.grid}>
                    {filteredApartments.map((apartment) => (
                        <ApartmentCard
                            key={apartment.id}
                            apartment={apartment}
                            expandable
                            detailsHref={`/oferta/${apartment.id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <h3>Brak wyników</h3>
                    <p>Zmodyfikuj filtry albo skontaktuj się z nami - możemy przygotować ofertę indywidualną.</p>
                </div>
            )}

            <section className={styles.conversionPanel}>
                <div>
                    <h2>Potrzebujesz pomocy w wyborze mieszkania?</h2>
                    <p>
                        Doradzimy Ci najlepszy układ i budżet, porównamy dostępne lokale i umówimy spotkanie na budowie.
                    </p>
                </div>
                <div className={styles.conversionActions}>
                    <a href="tel:+48884869402" className="btn">Zadzwoń teraz</a>
                    <Link href="/kontakt" className="btn btnOutline">Napisz wiadomość</Link>
                </div>
            </section>
        </div>
    );
}
