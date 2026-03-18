'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const STORAGE_FOLDER_BY_ENDPOINT = {
    '/api/apartments': 'apartments',
    '/api/investments': 'investments',
    '/api/news': 'news'
};

function sanitizeFileName(fileName) {
    return fileName
        .normalize('NFKD')
        .replace(/[^\w.\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// --- MAIN PAGE ---
export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Nieprawidłowe hasło');
        }
    };

    if (!isAuthenticated) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
                    <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Panel Administratora</h1>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#111', color: 'white' }}
                        />
                        <button type="submit" className="btn" style={{ width: '100%' }}>Zaloguj</button>
                    </form>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="container section" style={{ paddingTop: '120px' }}>
                <AdminContent />
            </div>
            <Footer />
        </main>
    );
}

// --- TABBED CONTENT ---
function AdminContent() {
    const [activeTab, setActiveTab] = useState('apartments');

    const tabStyle = (tabName) => ({
        appearance: 'none',
        backgroundColor: 'transparent',
        padding: '1rem 2rem',
        cursor: 'pointer',
        background: activeTab === tabName ? 'var(--primary)' : 'transparent',
        color: activeTab === tabName ? '#000' : '#888',
        border: `1px solid ${activeTab === tabName ? 'var(--primary)' : '#333'}`,
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        fontWeight: 'bold',
        transition: 'all 0.3s'
    });

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Zarządzanie Treścią</h1>
            <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '2rem' }}>
                <button type="button" onClick={() => setActiveTab('apartments')} style={tabStyle('apartments')}>Mieszkania</button>
                <button type="button" onClick={() => setActiveTab('investments')} style={tabStyle('investments')}>Inwestycje</button>
                <button type="button" onClick={() => setActiveTab('blog')} style={tabStyle('blog')}>Blog / News</button>
            </div>

            {activeTab === 'apartments' && <ApartmentsManager />}
            {activeTab === 'investments' && <InvestmentsManager />}
            {activeTab === 'blog' && <BlogManager />}
        </div>
    );
}

// --- APARTMENTS MANAGER ---
function ApartmentsManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [editingItem, setEditingItem] = useState(null);

    async function fetchItems() {
        const res = await fetch('/api/apartments');
        if (res.ok) setItems(await res.json());
    }

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            const res = await fetch('/api/apartments');
            if (!res.ok || !isActive) return;
            const data = await res.json();
            if (isActive) setItems(data);
        };

        void loadItems();

        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć?')) return;
        await fetch(`/api/apartments?id=${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>Dodaj Mieszkanie</button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--primary)' }}>{item.name}</strong>
                                    <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.9rem' }}>{item.status}</span>
                                </div>
                                <div>
                                    <button onClick={() => { setEditingItem(item); setView('form'); }} style={{ marginRight: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#fff' }}>Edytuj</button>
                                    <button onClick={() => handleDelete(item.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#e74c3c' }}>Usuń</button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/apartments"
                    initialData={editingItem}
                    onSuccess={() => { fetchItems(); setView('list'); }}
                    onCancel={() => setView('list')}
                    fields={[
                        { name: 'name', label: 'Nazwa / Numer', type: 'text' },
                        { name: 'floor', label: 'Piętro', type: 'number' },
                        { name: 'rooms', label: 'Pokoje', type: 'number' },
                        { name: 'area', label: 'Powierzchnia (m²)', type: 'number', step: '0.1' },
                        { name: 'price', label: 'Cena (PLN)', type: 'number' },
                        { name: 'status', label: 'Status', type: 'select', options: [['available', 'Dostępne'], ['reserved', 'Zarezerwowane'], ['sold', 'Sprzedane']] },
                        { name: 'description', label: 'Opis', type: 'textarea' },
                        { name: 'images', label: 'Zdjęcia', type: 'file', multiple: true }
                    ]}
                />
            )}
        </div>
    );
}

// --- INVESTMENTS MANAGER ---
function InvestmentsManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list');
    const [editingItem, setEditingItem] = useState(null);

    async function fetchItems() {
        const res = await fetch('/api/investments');
        if (res.ok) setItems(await res.json());
    }

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            const res = await fetch('/api/investments');
            if (!res.ok || !isActive) return;
            const data = await res.json();
            if (isActive) setItems(data);
        };

        void loadItems();

        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć?')) return;
        await fetch(`/api/investments?id=${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>Dodaj Inwestycję</button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--primary)' }}>{item.name}</strong>
                                    <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.9rem' }}>{item.location}</span>
                                </div>
                                <div>
                                    <button onClick={() => { setEditingItem(item); setView('form'); }} style={{ marginRight: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#fff' }}>Edytuj</button>
                                    <button onClick={() => handleDelete(item.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#e74c3c' }}>Usuń</button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/investments"
                    initialData={editingItem}
                    onSuccess={() => { fetchItems(); setView('list'); }}
                    onCancel={() => setView('list')}
                    fields={[
                        { name: 'name', label: 'Nazwa Inwestycji', type: 'text' },
                        { name: 'location', label: 'Lokalizacja', type: 'text' },
                        { name: 'description', label: 'Opis', type: 'textarea' },
                        { name: 'images', label: 'Zdjęcia', type: 'file', multiple: true }
                    ]}
                />
            )}
        </div>
    );
}

// --- BLOG MANAGER ---
function BlogManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list');
    const [editingItem, setEditingItem] = useState(null);

    async function fetchItems() {
        const res = await fetch('/api/news');
        if (res.ok) setItems(await res.json());
    }

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            const res = await fetch('/api/news');
            if (!res.ok || !isActive) return;
            const data = await res.json();
            if (isActive) setItems(data);
        };

        void loadItems();

        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć?')) return;
        await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>Dodaj News</button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--primary)' }}>{item.title}</strong>
                                    <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.9rem' }}>{item.date}</span>
                                </div>
                                <div>
                                    <button onClick={() => { setEditingItem(item); setView('form'); }} style={{ marginRight: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#fff' }}>Edytuj</button>
                                    <button onClick={() => handleDelete(item.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#e74c3c' }}>Usuń</button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/news"
                    initialData={editingItem}
                    onSuccess={() => { fetchItems(); setView('list'); }}
                    onCancel={() => setView('list')}
                    fields={[
                        { name: 'title', label: 'Tytuł', type: 'text' },
                        { name: 'date', label: 'Data', type: 'date' },
                        { name: 'content', label: 'Treść', type: 'textarea' },
                        { name: 'image', label: 'Zdjęcie główne', type: 'file', multiple: false }
                    ]}
                />
            )}
        </div>
    );
}

// --- REUSABLE FORM COMPONENT ---
function GenericForm({ endpoint, initialData, onSuccess, onCancel, fields }) {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Init empty
            const empty = {};
            fields.forEach(f => empty[f.name] = '');
            setFormData(empty);
        }
        setFiles({});
        setSubmitError('');
    }, [initialData, fields]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);
        const tooLargeFile = selectedFiles.find(file => file.size > MAX_FILE_SIZE_BYTES);
        if (tooLargeFile) {
            alert(`Plik "${tooLargeFile.name}" przekracza limit 50MB.`);
            e.target.value = '';
            return;
        }

        setFiles(prev => ({
            ...prev,
            [fieldName]: e.target.multiple ? selectedFiles : selectedFiles[0]
        }));
    };

    const uploadSingleFile = async (file, folder) => {
        const safeName = sanitizeFileName(file.name);
        const uniquePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(uniquePath, file, {
                contentType: file.type || 'application/octet-stream',
                upsert: false
            });

        if (uploadError) {
            throw new Error(uploadError.message || `Upload failed for ${file.name}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(uniquePath);

        return publicUrl;
    };

    const appendUploadedFiles = async (data) => {
        const folder = STORAGE_FOLDER_BY_ENDPOINT[endpoint] || 'uploads';

        for (const [fieldName, fileOrFiles] of Object.entries(files)) {
            const selectedFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
            const uploadedUrls = [];

            for (const file of selectedFiles) {
                if (!file) continue;
                uploadedUrls.push(await uploadSingleFile(file, folder));
            }

            uploadedUrls.forEach(url => data.append(fieldName, url));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');

        try {
            const data = new FormData();
            if (initialData && initialData.id) data.append('id', initialData.id);

            Object.keys(formData).forEach(key => {
                // Exclude arrays/files from direct append if they are managed separately or if they are from initialData JSON
                if (typeof formData[key] !== 'object') {
                    data.append(key, formData[key]);
                }
            });

            await appendUploadedFiles(data);

            const method = initialData ? 'PUT' : 'POST';
            const res = await fetch(endpoint, { method, body: data });
            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(payload?.error || 'Blad zapisu');
            }

            setFiles({});
            onSuccess();
        } catch (err) {
            console.error(err);
            setSubmitError(err?.message || 'Blad polaczenia');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedFilesInfo = (fieldName) => {
        const selected = files[fieldName];
        if (!selected) return '';
        if (Array.isArray(selected)) return `Wybrano plikow: ${selected.length}`;
        return `Wybrany plik: ${selected.name}`;
    };

    const inputStyle = { width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', marginBottom: '1rem' };

    return (
        <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <h2 style={{ marginBottom: '2rem' }}>{initialData ? 'Edycja' : 'Dodawanie'}</h2>
            <form onSubmit={handleSubmit}>
                {fields.map(field => (
                    <div key={field.name}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>{field.label}</label>

                        {field.type === 'textarea' ? (
                            <textarea name={field.name} value={formData[field.name] || ''} onChange={handleChange} rows="5" style={inputStyle} />
                        ) : field.type === 'select' ? (
                            <select name={field.name} value={formData[field.name] || ''} onChange={handleChange} style={inputStyle}>
                                {field.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                            </select>
                        ) : field.type === 'file' ? (
                            <>
                                <input type="file" accept="image/*" multiple={field.multiple} onChange={(e) => handleFileChange(e, field.name)} style={inputStyle} />
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                    Maksymalny rozmiar pliku: 50MB. {getSelectedFilesInfo(field.name)}
                                </p>
                            </>
                        ) : (
                            <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleChange} step={field.step} style={inputStyle} />
                        )}
                    </div>
                ))}

                {submitError && (
                    <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                        {submitError}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</button>
                    <button type="button" onClick={onCancel} className="btn" style={{ background: '#333', color: '#fff' }}>Anuluj</button>
                </div>
            </form>
        </div>
    );
}

