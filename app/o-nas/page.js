import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../page.module.css';

export default function AboutPage() {
    return (
        <main>
            <Navbar />
            <div className="container section" style={{ paddingTop: '140px' }}>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>O Nas</h1>

                <div className={styles.aboutGrid}>
                    <div className={styles.aboutContent}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: '800' }}>Doświadczenie i Pasja w Budownictwie</h2>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#333' }}>
                            Firma <strong>PAWEŁ SOŁDAŃSKI</strong> powstała z pasji do tworzenia wyjątkowych miejsc do życia i pracy.
                            Od lat działamy na rynku budowlanym, zdobywając cenne doświadczenie i zaufanie Klientów.
                        </p>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#333' }}>
                            Naszą misją jest dostarczanie nieruchomości, które nie tylko spełniają, ale i przewyższają oczekiwania
                            pod względem jakości, estetyki i komfortu. Nasz zespół to wykwalifikowani specjaliści – od inżynierów
                            po architektów – którzy dbają o każdy detal na każdym etapie realizacji projektu.
                        </p>
                        <p style={{ fontSize: '1.1rem', color: '#333' }}>
                            Stawiamy na transparentność, rzetelność i terminowość. Budujemy z myślą o przyszłych pokoleniach,
                            łącząc nowoczesne technologie z tradycją solidnego rzemiosła.
                        </p>
                    </div>
                    <div className={styles.aboutStats}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>15+</span>
                            <span className={styles.statLabel}>Lat doświadczenia</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Zrealizowanych projektów</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>100%</span>
                            <span className={styles.statLabel}>Zadowolonych klientów</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
