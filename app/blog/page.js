import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

async function getNews() {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

export default async function BlogPage() {
    const news = await getNews();

    return (
        <main>
            <Navbar />
            <section className="section container" style={{ paddingTop: '140px' }}>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '4rem' }}>Aktualności</h1>

                <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {news.map((item) => (
                        <article key={item.id} style={{
                            background: '#fff',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid #eee',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                        }}>
                            {item.image && (
                                <div style={{
                                    height: '300px',
                                    width: '100%',
                                    position: 'relative'
                                }}>
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 800px) 100vw, 800px"
                                    />
                                </div>
                            )}

                            <div style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>
                                    {item.date}
                                </div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>{item.title}</h2>
                                <div style={{ lineHeight: '1.8', color: '#555', whiteSpace: 'pre-wrap' }}>
                                    {item.content}
                                </div>
                            </div>
                        </article>
                    ))}

                    {news.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888' }}>Brak aktualności.</p>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
