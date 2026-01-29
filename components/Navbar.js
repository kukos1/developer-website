import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logoContainer}>
                    <Image src="/logo.jpg" alt="Logo" width={50} height={50} className={styles.logoImg} />
                    <div className={styles.logoText}>
                        <span className={styles.companyName}>PAWEŁ SOŁDAŃSKI</span>
                        <span className={styles.tagline}>Usługi Remontowo Budowlane</span>
                    </div>
                </Link>
                <ul className={styles.navLinks}>
                    <li><Link href="/">Strona Główna</Link></li>
                    <li><Link href="/inwestycje">Inwestycje</Link></li>
                    <li><Link href="/oferta">Oferta</Link></li>
                    <li><Link href="/blog">Aktualności</Link></li>
                    <li><Link href="/o-nas">O nas</Link></li>
                    <li><Link href="/kontakt">Kontakt</Link></li>
                    <li><Link href="/admin">Panel</Link></li>
                </ul>
            </div>
        </nav>
    );
}
