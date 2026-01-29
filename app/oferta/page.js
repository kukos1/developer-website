import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApartmentCard from '@/components/ApartmentCard';
import fs from 'fs/promises';
import path from 'path';

async function getApartments() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'apartments.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

export default async function OfferPage() {
    const apartments = await getApartments();

    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container section">
                <h1 style={{ marginBottom: '3rem', fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>Pełna Oferta</h1>
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
