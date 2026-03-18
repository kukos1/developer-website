import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    <div>
                        <h3 className={styles.footerLogo}>PAWEŁ SOŁDAŃSKI</h3>
                        <p className={styles.footerTagline}>Uslugi Remontowo Budowlane</p>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>Nawigacja</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link href="/">Strona Glowna</Link></li>
                            <li><Link href="/inwestycje">Inwestycje</Link></li>
                            <li><Link href="/oferta">Oferta</Link></li>
                            <li><Link href="/blog">Aktualnosci</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>Firma</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link href="/o-nas">O nas</Link></li>
                            <li><Link href="/kontakt">Kontakt</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>Kontakt</h4>
                        <p className={styles.footerContact}>
                            <strong>Gorzewo 31C</strong><br />
                            09-200 Sierpc<br /><br />
                            <a href="tel:+48884869402">Tel: 884-869-402</a><br />
                            <a href="tel:+48728863971">Tel: 728-863-971</a><br />
                            <a href="mailto:solbet@wp.pl">Email: solbet@wp.pl</a><br /><br />
                            NIP: 7761235157
                        </p>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>
                        &copy; {new Date().getFullYear()} PAWEŁ SOŁDAŃSKI - Uslugi Remontowo Budowlane.
                        Wszelkie prawa zastrzezone.
                    </p>
                </div>
            </div>
        </footer>
    );
}
