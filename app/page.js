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

  const featuredApartments = apartments.filter((item) => item.status === 'available').slice(0, 3);
  const featuredInvestments = investments.slice(0, 3);

  return (
    <main>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroBgDecoration}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Budujemy przyszlosc,
            <br />
            tworzymy przestrzen
          </h1>
          <p className={styles.heroSubtitle}>
            Realizujemy nowoczesne inwestycje mieszkaniowe i komercyjne.
            Projektujemy miejsca, w ktorych dobrze sie zyje i pracuje.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/inwestycje" className="btn shimmer">
              Nasze inwestycje
            </Link>
            <Link href="/oferta" className="btn btnOutline">
              Zobacz mieszkania
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
              <div className={styles.whyUsIcon}>01</div>
              <h3>Doswiadczenie</h3>
              <p>Ponad 15 lat praktyki i sprawdzony proces realizacji od projektu po finalny odbior.</p>
            </div>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}>02</div>
              <h3>Jakosc</h3>
              <p>Stawiamy na trwale materialy, funkcjonalne uklady i wysoki standard wykonania.</p>
            </div>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}>03</div>
              <h3>Wsparcie</h3>
              <p>Prowadzimy klienta przez caly proces zakupu i pomagamy dopasowac najlepsza oferte.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="inwestycje" className="section container">
        <h2 className={styles.sectionTitle}>Nasze inwestycje</h2>
        <div className={styles.featuredGrid}>
          {featuredInvestments.map((investment) => (
            <Link href="/inwestycje" key={investment.id} className={styles.investmentCard}>
              {Array.isArray(investment.images) && investment.images.length > 0 && (
                <div className={`${styles.investmentImage} ${styles.investmentImageWrapper}`}>
                  <Image
                    src={investment.images[0]}
                    alt={investment.name || 'Inwestycja'}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className={styles.investmentContent}>
                <h3>{investment.name || 'Inwestycja'}</h3>
                <p className={styles.investmentLocation}>Lokalizacja: {investment.location || 'w przygotowaniu'}</p>
                <p className={styles.investmentDesc}>
                  {investment.description || 'Szczegoly inwestycji pojawia sie wkrotce.'}
                </p>
                <span className={styles.investmentLink}>Poznaj szczegoly</span>
              </div>
            </Link>
          ))}
          {featuredInvestments.length === 0 && (
            <p className={styles.noInvestments}>Brak inwestycji do wyswietlenia.</p>
          )}
        </div>
        <div className={styles.centerMt4}>
          <Link href="/inwestycje" className="btn btnOutline">
            Wszystkie inwestycje
          </Link>
        </div>
      </section>

      <section className={`section ${styles.bgLight}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Aktualna oferta mieszkan</h2>
          <div className={styles.featuredGrid}>
            {featuredApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                detailsHref={`/oferta/${apartment.id}`}
              />
            ))}
          </div>
          {featuredApartments.length === 0 && (
            <p className={styles.noApartments}>
              Aktualnie nie mamy mieszkan ze statusem &quot;dostepne&quot;. Skontaktuj sie z nami po oferte indywidualna.
            </p>
          )}
          <div className={styles.centerMt4}>
            <Link href="/oferta" className="btn shimmer">
              Wszystkie mieszkania
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
