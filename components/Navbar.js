import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    PAWEŁ SOŁDAŃSKI
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
