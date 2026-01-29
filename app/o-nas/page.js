import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <main>
            <Navbar />
            <div className="container section" style={{ paddingTop: '120px' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>O Nas</h1>

                <div style={{ maxWidth: '800px', lineHeight: '1.8', color: '#ccc' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Doświadczenie i Pasja w Budownictwie</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Firma <strong>PAWEŁ SOŁDAŃSKI</strong> powstała z pasji do tworzenia wyjątkowych miejsc do życia i pracy.
                        Od lat działamy na rynku budowlanym, zdobywając cenne doświadczenie i zaufanie Klientów.
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Naszą misją jest dostarczanie nieruchomości, które nie tylko spełniają, ale i przewyższają oczekiwania
                        pod względem jakości, estetyki i komfortu. Nasz zespół to wykwalifikowani specjaliści – od inżynierów
                        po architektów – którzy dbają o każdy detal na każdym etapie realizacji projektu.
                    </p>
                    <p>
                        Stawiamy na transparentność, rzetelność i terminowość. Budujemy z myślą o przyszłych pokoleniach,
                        łącząc nowoczesne technologie z tradycją solidnego rzemiosła.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
