import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    <div>
                        <h3 className={styles.footerLogo}>PAWEŁ SOŁDAŃSKI</h3>
                        <p className={styles.footerTagline}>Usługi Remontowo Budowlane</p>
                    </div>
                    <div>
                        <h4 className={styles.footerTitle}>Nawigacja</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link href="/">Strona Główna</Link></li>
                            <li><Link href="/inwestycje">Inwestycje</Link></li>
                            <li><Link href="/oferta">Oferta</Link></li>
                            <li><Link href="/blog">Aktualności</Link></li>
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
                            Tel: +48 123 456 789<br />
                            Email: biuro@pawelsoldanski.pl
                        </p>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>&copy; {new Date().getFullYear()} PAWEŁ SOŁDAŃSKI - Usługi Remontowo Budowlane. Wszelkie prawa zastrzeżone.</p>
                </div>
            </div>
        </footer>
    );
}
