'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
    { href: '/', label: 'Strona Glowna' },
    { href: '/inwestycje', label: 'Inwestycje' },
    { href: '/oferta', label: 'Oferta' },
    { href: '/blog', label: 'Aktualnosci' },
    { href: '/o-nas', label: 'O nas' },
    { href: '/kontakt', label: 'Kontakt' },
    { href: '/admin', label: 'Panel' }
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isItemActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logoContainer}>
                    <Image src="/logo.jpg" alt="Logo firmy" width={52} height={52} className={styles.logoImg} />
                    <div className={styles.logoText}>
                        <span className={styles.companyName}>PAWEŁ SOŁDAŃSKI</span>
                        <span className={styles.tagline}>Uslugi Remontowo Budowlane</span>
                    </div>
                </Link>

                <button
                    className={`${styles.hamburger} ${isOpen ? styles.hamburgerActive : ''}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Menu"
                    aria-expanded={isOpen}
                    type="button"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`${styles.navLinks} ${isOpen ? styles.navLinksActive : ''}`}>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.navLink} ${isItemActive(item.href) ? styles.activeLink : ''}`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
