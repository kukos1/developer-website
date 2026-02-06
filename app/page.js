import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApartmentCard from '@/components/ApartmentCard';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getApartments() {
  try {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return [];
  }
}

async function getInvestments() {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching investments:', error);
    return [];
  }
}

export default async function Home() {
  const apartments = await getApartments();
  const investments = await getInvestments();
  const featuredApartments = (apartments || []).filter(a => a.status === 'available').slice(0, 3);
  const featuredInvestments = (investments || []).slice(0, 3);

  return (
    <main>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroBgDecoration}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Budujemy Przyszłość,<br />Tworzymy Przestrzeń</h1>
          <p className={styles.heroSubtitle}>Nowoczesne inwestycje budowlane dopasowane do Twoich potrzeb, które przetrwają pokolenia.</p>
          <div className={styles.heroBtns}>
            <Link href="/inwestycje" className="btn shimmer">
              Nasze Inwestycje
            </Link>
            <Link href="/oferta" className="btn btnOutline">
              Szukaj Mieszkania
            </Link>
          </div>
        </div>
        <div className={styles.scrollDown}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
        </div>
      </section>

      <section className={styles.whyUs}>
        <div className="container">
          <div className={styles.whyUsGrid}>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}>🏗️</div>
              <h3>Solidność</h3>
              <p>Ponad 15 lat doświadczenia w realizacji najbardziej wymagających projektów budowlanych.</p>
            </div>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}>✨</div>
              <h3>Nowoczesność</h3>
              <p>Wykorzystujemy najnowsze technologie i materiały premium dla Twojego komfortu.</p>
            </div>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}>🤝</div>
              <h3>Zaufanie</h3>
              <p>Setki zadowolonych rodzin, które odnalazły swój wymarzony dom w naszych inwestycjach.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="inwestycje" className="section container">
        <h2 className={styles.sectionTitle}>Nasze Inwestycje</h2>
        <div className={styles.featuredGrid}>
          {featuredInvestments.map((inv) => (
            <Link href="/inwestycje" key={inv.id} className={styles.investmentCard}>
              {inv.images && inv.images.length > 0 && (
                <div className={`${styles.investmentImage} ${styles.investmentImageWrapper}`}>
                  <Image
                    src={inv.images[0]}
                    alt={inv.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
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
            <p className={styles.noInvestments}>Brak inwestycji do wyświetlenia.</p>
          )}
        </div>
        <div className={styles.centerMt4}>
          <Link href="/inwestycje" className="btn btnOutline">
            Wszystkie Inwestycje
          </Link>
        </div>
      </section>

      <section className={`section ${styles.bgLight}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Aktualna Oferta Mieszkań</h2>
          <div className={styles.featuredGrid}>
            {featuredApartments.map((apt) => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
          {featuredApartments.length === 0 && (
            <p className={styles.noApartments}>Wszystkie mieszkania zostały sprzedane. Sprawdź nasze inwestycje!</p>
          )}
          <div className={styles.centerMt4}>
            <Link href="/oferta" className="btn shimmer">
              Wszystkie Mieszkania
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
