import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApartmentCard from '@/components/ApartmentCard';
import styles from './page.module.css';
import fs from 'fs/promises';
import path from 'path';

async function getApartments() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'apartments.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function getInvestments() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'investments.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const apartments = await getApartments();
  const investments = await getInvestments();
  const featuredApartments = apartments.filter(a => a.status === 'available').slice(0, 3);
  const featuredInvestments = investments.slice(0, 3);

  return (
    <main>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Budujemy Przyszłość,<br />Tworzymy Przestrzeń</h1>
          <p className={styles.heroSubtitle}>Nowoczesne inwestycje budowlane dopasowane do Twoich potrzeb.</p>
          <div className={styles.heroBtns}>
            <Link href="/inwestycje" className="btn">
              Nasze Inwestycje
            </Link>
            <Link href="/oferta" className="btn btnOutline">
              Szukaj Mieszkania
            </Link>
          </div>
        </div>
      </section>

      <section id="inwestycje" className="section container">
        <h2 className={styles.sectionTitle}>Nasze Inwestycje</h2>
        <div className={styles.featuredGrid}>
          {featuredInvestments.map((inv) => (
            <Link href="/inwestycje" key={inv.id} className={styles.investmentCard}>
              {inv.images && inv.images.length > 0 && (
                <div className={styles.investmentImage} style={{ backgroundImage: `url(${inv.images[0]})` }}></div>
              )}
              <div className={styles.investmentContent}>
                <h3>{inv.name}</h3>
                <p className={styles.investmentLocation}>📍 {inv.location}</p>
                <p className={styles.investmentDesc}>{inv.description}</p>
                <span className={styles.investmentLink}>Zobacz szczegóły →</span>
              </div>
            </Link>
          ))}
          {featuredInvestments.length === 0 && (
            <p style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center' }}>Brak inwestycji do wyświetlenia.</p>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/inwestycje" className="btn btnOutline">
            Wszystkie Inwestycje
          </Link>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Aktualna Oferta Mieszkań</h2>
          <div className={styles.featuredGrid}>
            {featuredApartments.map((apt) => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
          {featuredApartments.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>Wszystkie mieszkania zostały sprzedane. Sprawdź nasze inwestycje!</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/oferta" className="btn">
              Wszystkie Mieszkania
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
