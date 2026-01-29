'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

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

                <button
                    className={`${styles.hamburger} ${isOpen ? styles.hamburgerActive : ''}`}
                    onClick={toggleMenu}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`${styles.navLinks} ${isOpen ? styles.navLinksActive : ''}`}>
                    <li><Link href="/" onClick={() => setIsOpen(false)}>Strona Główna</Link></li>
                    <li><Link href="/inwestycje" onClick={() => setIsOpen(false)}>Inwestycje</Link></li>
                    <li><Link href="/oferta" onClick={() => setIsOpen(false)}>Oferta</Link></li>
                    <li><Link href="/blog" onClick={() => setIsOpen(false)}>Aktualności</Link></li>
                    <li><Link href="/o-nas" onClick={() => setIsOpen(false)}>O nas</Link></li>
                    <li><Link href="/kontakt" onClick={() => setIsOpen(false)}>Kontakt</Link></li>
                    <li><Link href="/admin" onClick={() => setIsOpen(false)}>Panel</Link></li>
                </ul>
            </div>
        </nav>
    );
}
