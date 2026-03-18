import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../page.module.css';

export default function AboutPage() {
    return (
        <main>
            <Navbar />
            <div className="container section" style={{ paddingTop: '140px' }}>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>O nas</h1>

                <div className={styles.aboutGrid}>
                    <div className={styles.aboutContent}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: '800' }}>Doswiadczenie i pasja w budownictwie</h2>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#333' }}>
                            Firma <strong>PAWEL SOLDANSKI</strong> powstala z pasji do tworzenia wyjatkowych miejsc do zycia i pracy.
                            Od lat dzialamy na rynku budowlanym, zdobywajac cenne doswiadczenie i zaufanie klientow.
                        </p>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#333' }}>
                            Nasza misja jest dostarczanie nieruchomosci, ktore nie tylko spelniaja, ale i przewyzszaja oczekiwania
                            pod wzgledem jakosci, estetyki i komfortu. Nasz zespol to wykwalifikowani specjalisci - od inzynierow
                            po architektow - ktorzy dbaja o kazdy detal na kazdym etapie realizacji projektu.
                        </p>
                        <p style={{ fontSize: '1.1rem', color: '#333' }}>
                            Stawiamy na transparentnosc, rzetelnosc i terminowosc. Budujemy z mysla o przyszlych pokoleniach,
                            laczac nowoczesne technologie z tradycja solidnego rzemiosla.
                        </p>
                    </div>
                    <div className={styles.aboutStats}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>15+</span>
                            <span className={styles.statLabel}>Lat doswiadczenia</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Zrealizowanych projektow</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>100%</span>
                            <span className={styles.statLabel}>Zadowolonych klientow</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
