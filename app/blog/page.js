import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import fs from 'fs/promises';
import path from 'path';

async function getNews() {
    const dataFilePath = path.join(process.cwd(), 'data', 'news.json');
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

export default async function BlogPage() {
    const news = await getNews();

    return (
        <main>
            <Navbar />
            <section className="section container" style={{ paddingTop: '120px' }}>
                <h1 style={{ marginBottom: '3rem', textAlign: 'center', fontSize: '2.5rem' }}>Aktualności</h1>

                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {news.map((item) => (
                        <article key={item.id} style={{
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {item.image && (
                                <div style={{
                                    height: '300px',
                                    width: '100%',
                                    background: `url(${item.image}) center/cover no-repeat`
                                }}></div>
                            )}

                            <div style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {item.date}
                                </div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>{item.title}</h2>
                                <div style={{ lineHeight: '1.8', color: '#ccc', whiteSpace: 'pre-wrap' }}>
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
