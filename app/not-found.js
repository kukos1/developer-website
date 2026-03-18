import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
    return (
        <main>
            <Navbar />
            <section style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <h1 style={{ fontSize: '8rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>404</h1>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Strona nie została znaleziona</h2>
                <p style={{ color: '#888', marginBottom: '2rem', maxWidth: '500px' }}>
                    Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.
                </p>
                <Link href="/" className="btn">
                    Wróć na stronę główną
                </Link>
            </section>
            <Footer />
        </main>
    );
}
