'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const STORAGE_FOLDER_BY_ENDPOINT = {
    '/api/apartments': 'apartments',
    '/api/investments': 'investments',
    '/api/news': 'news'
};

const LEAD_STATUSES = [
    ['new', 'Nowy'],
    ['in_progress', 'W trakcie'],
    ['closed', 'Zakończony'],
    ['spam', 'Spam']
];

function sanitizeFileName(fileName) {
    return fileName
        .normalize('NFKD')
        .replace(/[^\w.\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function toJsonOrNull(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options
    });
    const payload = await toJsonOrNull(response);

    if (!response.ok) {
        const message = payload?.error || `Request failed (${response.status})`;
        throw new Error(message);
    }

    return payload;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isActive = true;

        const checkSession = async () => {
            try {
                const payload = await requestJson('/api/admin/session', {
                    method: 'GET',
                    cache: 'no-store'
                });
                if (isActive) setIsAuthenticated(Boolean(payload?.authenticated));
            } catch (error) {
                console.error('Session check failed:', error);
                if (isActive) setIsAuthenticated(false);
            } finally {
                if (isActive) setAuthReady(true);
            }
        };

        void checkSession();
        return () => { isActive = false; };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsSubmitting(true);

        try {
            await requestJson('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            setIsAuthenticated(true);
            setPassword('');
        } catch (error) {
            setAuthError(error?.message || 'Login failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await requestJson('/api/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsAuthenticated(false);
        }
    };

    if (!authReady) {
        return (
            <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <p>Sprawdzanie sesji administratora...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <div className="container" style={{ maxWidth: '420px', marginTop: '100px' }}>
                    <h1 style={{ marginBottom: '1.4rem', textAlign: 'center' }}>Panel administratora</h1>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff' }}
                        />
                        {authError && <p style={{ color: '#e66', fontSize: '0.9rem' }}>{authError}</p>}
                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Logowanie...' : 'Zaloguj'}
                        </button>
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
                <AdminContent onLogout={handleLogout} />
            </div>
            <Footer />
        </main>
    );
}

function AdminContent({ onLogout }) {
    const [activeTab, setActiveTab] = useState('apartments');

    const tabStyle = (tabName) => ({
        appearance: 'none',
        backgroundColor: 'transparent',
        padding: '1rem 1.7rem',
        cursor: 'pointer',
        color: activeTab === tabName ? '#001b34' : '#667',
        border: `1px solid ${activeTab === tabName ? 'var(--primary)' : '#c4d3e3'}`,
        background: activeTab === tabName ? 'rgba(0, 111, 219, 0.2)' : 'rgba(255,255,255,0.65)',
        borderBottom: 'none',
        borderRadius: '10px 10px 0 0',
        fontWeight: 700,
        transition: 'all 0.2s ease'
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h1 style={{ margin: 0 }}>Zarządzanie treścią</h1>
                <button type="button" className="btn btnOutline" onClick={onLogout}>Wyloguj</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #c4d3e3', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <button type="button" onClick={() => setActiveTab('apartments')} style={tabStyle('apartments')}>Mieszkania</button>
                <button type="button" onClick={() => setActiveTab('investments')} style={tabStyle('investments')}>Inwestycje</button>
                <button type="button" onClick={() => setActiveTab('blog')} style={tabStyle('blog')}>Blog / News</button>
                <button type="button" onClick={() => setActiveTab('leads')} style={tabStyle('leads')}>Leady</button>
            </div>

            {activeTab === 'apartments' && <ApartmentsManager />}
            {activeTab === 'investments' && <InvestmentsManager />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'leads' && <LeadsManager />}
        </div>
    );
}

function ApartmentsManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list');
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        try {
            const payload = await requestJson('/api/apartments');
            setItems(Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            try {
                const payload = await requestJson('/api/apartments');
                if (isActive) setItems(Array.isArray(payload) ? payload : []);
            } catch (error) {
                console.error(error);
            }
        };

        void loadItems();
        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć ten rekord?')) return;
        await requestJson(`/api/apartments?id=${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>
                        Dodaj mieszkanie
                    </button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map((item) => (
                            <RecordRow
                                key={item.id}
                                title={item.name}
                                subtitle={item.status}
                                onEdit={() => { setEditingItem(item); setView('form'); }}
                                onDelete={() => void handleDelete(item.id)}
                            />
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/apartments"
                    initialData={editingItem}
                    onSuccess={() => { void fetchItems(); setView('list'); }}
                    onCancel={() => setView('list')}
                    fields={[
                        { name: 'name', label: 'Nazwa / Numer', type: 'text' },
                        { name: 'floor', label: 'Piętro', type: 'number' },
                        { name: 'rooms', label: 'Pokoje', type: 'number' },
                        { name: 'area', label: 'Powierzchnia (m2)', type: 'number', step: '0.1' },
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

function InvestmentsManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list');
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        try {
            const payload = await requestJson('/api/investments');
            setItems(Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            try {
                const payload = await requestJson('/api/investments');
                if (isActive) setItems(Array.isArray(payload) ? payload : []);
            } catch (error) {
                console.error(error);
            }
        };

        void loadItems();
        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć ten rekord?')) return;
        await requestJson(`/api/investments?id=${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>
                        Dodaj inwestycję
                    </button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map((item) => (
                            <RecordRow
                                key={item.id}
                                title={item.name}
                                subtitle={item.location}
                                onEdit={() => { setEditingItem(item); setView('form'); }}
                                onDelete={() => void handleDelete(item.id)}
                            />
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/investments"
                    initialData={editingItem}
                    onSuccess={() => { void fetchItems(); setView('list'); }}
                    onCancel={() => setView('list')}
                    fields={[
                        { name: 'name', label: 'Nazwa inwestycji', type: 'text' },
                        { name: 'location', label: 'Lokalizacja', type: 'text' },
                        { name: 'visualization_link', label: 'Link do wizualizacji (Google Drive)', type: 'url' },
                        { name: 'description', label: 'Opis', type: 'textarea' },
                        { name: 'images', label: 'Zdjęcia', type: 'file', multiple: true }
                    ]}
                />
            )}
        </div>
    );
}

function BlogManager() {
    const [items, setItems] = useState([]);
    const [view, setView] = useState('list');
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        try {
            const payload = await requestJson('/api/news');
            setItems(Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            try {
                const payload = await requestJson('/api/news');
                if (isActive) setItems(Array.isArray(payload) ? payload : []);
            } catch (error) {
                console.error(error);
            }
        };

        void loadItems();
        return () => { isActive = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Usunąć ten rekord?')) return;
        await requestJson(`/api/news?id=${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return (
        <div>
            {view === 'list' ? (
                <>
                    <button className="btn" onClick={() => { setEditingItem(null); setView('form'); }} style={{ marginBottom: '1rem' }}>
                        Dodaj news
                    </button>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map((item) => (
                            <RecordRow
                                key={item.id}
                                title={item.title}
                                subtitle={item.date}
                                onEdit={() => { setEditingItem(item); setView('form'); }}
                                onDelete={() => void handleDelete(item.id)}
                            />
                        ))}
                        {items.length === 0 && <p>Brak danych.</p>}
                    </div>
                </>
            ) : (
                <GenericForm
                    endpoint="/api/news"
                    initialData={editingItem}
                    onSuccess={() => { void fetchItems(); setView('list'); }}
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

function LeadsManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [deletingId, setDeletingId] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        setSubmitError('');

        try {
            const payload = await requestJson('/api/leads', { cache: 'no-store' });
            setItems(Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error(error);
            setSubmitError(error?.message || 'Nie udało się pobrać leadów.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadItems = async () => {
            try {
                const payload = await requestJson('/api/leads', { cache: 'no-store' });
                if (isActive) setItems(Array.isArray(payload) ? payload : []);
            } catch (error) {
                console.error(error);
                if (isActive) setSubmitError(error?.message || 'Nie udało się pobrać leadów.');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        setLoading(true);
        setSubmitError('');
        void loadItems();
        return () => { isActive = false; };
    }, []);

    const updateLeadStatus = async (id, status) => {
        setSubmitError('');
        try {
            await requestJson('/api/leads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            setItems((prev) => prev.map((item) => (
                item.id === id ? { ...item, status } : item
            )));
        } catch (error) {
            console.error(error);
            setSubmitError(error?.message || 'Nie udało się zaktualizować statusu.');
        }
    };

    const handleDeleteLead = async (id) => {
        if (!confirm('Usunąć ten lead?')) return;

        setDeletingId(id);
        setSubmitError('');

        try {
            await requestJson(`/api/leads?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error(error);
            setSubmitError(error?.message || 'Nie udało się usunąć leada.');
        } finally {
            setDeletingId('');
        }
    };

    const cardStyle = {
        background: '#f8fbff',
        border: '1px solid #d8e4f1',
        padding: '1rem',
        borderRadius: '10px',
        display: 'grid',
        gap: '0.7rem'
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <p style={{ color: '#48637f', margin: 0 }}>Nowe zapytania z formularza kontaktowego.</p>
                <button type="button" className="btn btnOutline" onClick={() => void fetchItems()} disabled={loading}>
                    {loading ? 'Odświeżanie...' : 'Odśwież listę'}
                </button>
            </div>

            {submitError && <p style={{ color: '#cf2e2e', margin: 0 }}>{submitError}</p>}

            {items.map((item) => {
                const createdAt = item.created_at ? new Date(item.created_at).toLocaleString('pl-PL') : '-';

                return (
                    <div key={item.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
                            <div>
                                <strong style={{ color: '#12345c' }}>{item.name}</strong>
                                <p style={{ margin: '0.35rem 0 0', color: '#4d647d', fontSize: '0.92rem' }}>
                                    {item.email}
                                    {item.phone ? ` | ${item.phone}` : ''}
                                </p>
                            </div>
                            <span style={{ color: '#5f738a', fontSize: '0.85rem' }}>{createdAt}</span>
                        </div>

                        <p style={{ margin: 0, color: '#29435f', lineHeight: 1.6 }}>{item.message}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#5f738a' }}>
                                Źródło: <strong>{item.source || 'kontakt'}</strong>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#29435f' }}>
                                    Status:
                                    <select
                                        value={item.status || 'new'}
                                        onChange={(event) => void updateLeadStatus(item.id, event.target.value)}
                                        disabled={deletingId === item.id}
                                        style={{
                                            border: '1px solid #c4d3e3',
                                            borderRadius: '6px',
                                            padding: '0.45rem 0.65rem',
                                            background: '#fff',
                                            color: '#12345c'
                                        }}
                                    >
                                        {LEAD_STATUSES.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => void handleDeleteLead(item.id)}
                                    disabled={deletingId === item.id}
                                    style={{
                                        border: '1px solid #ebc4c4',
                                        borderRadius: '6px',
                                        padding: '0.45rem 0.75rem',
                                        background: '#fff5f5',
                                        color: '#a82424',
                                        cursor: 'pointer',
                                        fontWeight: 700
                                    }}
                                >
                                    {deletingId === item.id ? 'Usuwanie...' : 'Usuń'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {!loading && items.length === 0 && (
                <p style={{ color: '#5f738a', margin: 0 }}>Brak leadów. Formularz kontaktowy nie wysłał jeszcze żadnych zapytań.</p>
            )}
        </div>
    );
}

function RecordRow({ title, subtitle, onEdit, onDelete }) {
    return (
        <div
            style={{
                background: '#f8fbff',
                border: '1px solid #d8e4f1',
                padding: '1rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.8rem'
            }}
        >
            <div>
                <strong style={{ color: '#12345c' }}>{title}</strong>
                {subtitle ? (
                    <span style={{ marginLeft: '0.8rem', color: '#567', fontSize: '0.9rem' }}>{subtitle}</span>
                ) : null}
            </div>
            <div>
                <button type="button" onClick={onEdit} style={{ marginRight: '0.8rem', cursor: 'pointer', background: 'none', border: 'none', color: '#12345c', fontWeight: 700 }}>
                    Edytuj
                </button>
                <button type="button" onClick={onDelete} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#cf2e2e', fontWeight: 700 }}>
                    Usuń
                </button>
            </div>
        </div>
    );
}

function GenericForm({ endpoint, initialData, onSuccess, onCancel, fields }) {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const [removedImagesByField, setRemovedImagesByField] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            const emptyState = {};
            fields.forEach((field) => { emptyState[field.name] = ''; });
            setFormData(emptyState);
        }

        setFiles({});
        setRemovedImagesByField({});
        setSubmitError('');
    }, [initialData, fields]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);
        const tooLargeFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
        if (tooLargeFile) {
            alert(`Plik "${tooLargeFile.name}" przekracza limit 50MB.`);
            e.target.value = '';
            return;
        }

        setFiles((prev) => ({
            ...prev,
            [fieldName]: e.target.multiple ? selectedFiles : selectedFiles[0]
        }));
    };

    const getExistingImages = (field) => {
        const rawValue = formData[field.name];
        let urls = [];

        if (Array.isArray(rawValue)) {
            urls = rawValue;
        } else if (typeof rawValue === 'string' && rawValue.trim().length > 0) {
            urls = [rawValue.trim()];
        }

        if (!field.multiple && urls.length > 1) {
            urls = urls.slice(0, 1);
        }

        const removed = new Set(removedImagesByField[field.name] || []);

        return urls
            .filter((value) => typeof value === 'string')
            .map((value) => value.trim())
            .filter((value) => value.length > 0 && !removed.has(value));
    };

    const markImageForRemoval = (fieldName, imageUrl) => {
        setRemovedImagesByField((prev) => {
            const current = prev[fieldName] || [];
            if (current.includes(imageUrl)) return prev;
            return {
                ...prev,
                [fieldName]: [...current, imageUrl]
            };
        });
    };

    const restoreRemovedImage = (fieldName, imageUrl) => {
        setRemovedImagesByField((prev) => {
            const current = prev[fieldName] || [];
            const next = current.filter((url) => url !== imageUrl);

            if (next.length === 0) {
                const nextState = { ...prev };
                delete nextState[fieldName];
                return nextState;
            }

            return {
                ...prev,
                [fieldName]: next
            };
        });
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

            uploadedUrls.forEach((url) => data.append(fieldName, url));
        }
    };

    const appendRemovedImages = (data) => {
        Object.values(removedImagesByField).forEach((urls) => {
            if (!Array.isArray(urls)) return;
            urls.forEach((url) => {
                if (typeof url === 'string' && url.trim().length > 0) {
                    data.append('removedImages', url.trim());
                }
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');

        try {
            const data = new FormData();
            if (initialData?.id) data.append('id', initialData.id);

            fields.forEach((field) => {
                if (field.type === 'file') return;

                const value = formData[field.name];
                if (typeof value !== 'object' && value != null) {
                    data.append(field.name, value);
                }
            });

            appendRemovedImages(data);
            await appendUploadedFiles(data);

            const method = initialData ? 'PUT' : 'POST';
            await requestJson(endpoint, {
                method,
                body: data
            });

            setFiles({});
            setRemovedImagesByField({});
            onSuccess();
        } catch (error) {
            console.error(error);
            setSubmitError(error?.message || 'Błąd połączenia');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedFilesInfo = (fieldName) => {
        const selected = files[fieldName];
        if (!selected) return '';
        if (Array.isArray(selected)) return `Wybrano plików: ${selected.length}`;
        return `Wybrany plik: ${selected.name}`;
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        background: '#fff',
        border: '1px solid #c4d3e3',
        color: '#0d1f39',
        borderRadius: '6px',
        marginBottom: '1rem'
    };

    return (
        <div style={{ background: '#f8fbff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #c4d3e3' }}>
            <h2 style={{ marginBottom: '1.4rem' }}>{initialData ? 'Edycja rekordu' : 'Nowy rekord'}</h2>
            <form onSubmit={handleSubmit}>
                {fields.map((field) => (
                    <div key={field.name}>
                        <label style={{ display: 'block', marginBottom: '0.45rem', color: '#345' }}>{field.label}</label>

                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                rows="5"
                                style={inputStyle}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                {field.options.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        ) : field.type === 'file' ? (
                            <>
                                {initialData && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        {getExistingImages(field).length > 0 && (
                                            <>
                                                <p style={{ margin: '0 0 0.5rem', color: '#456', fontSize: '0.88rem', fontWeight: 600 }}>
                                                    Aktualne zdjęcia
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                                    {getExistingImages(field).map((imageUrl, index) => (
                                                        <div
                                                            key={`${field.name}-${imageUrl}-${index}`}
                                                            style={{
                                                                border: '1px solid #d4dfeb',
                                                                borderRadius: '8px',
                                                                background: '#fff',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <Image
                                                                src={imageUrl}
                                                                alt={`${field.label} ${index + 1}`}
                                                                width={240}
                                                                height={180}
                                                                style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => markImageForRemoval(field.name, imageUrl)}
                                                                style={{
                                                                    width: '100%',
                                                                    border: 'none',
                                                                    borderTop: '1px solid #e6eef6',
                                                                    background: '#fff5f5',
                                                                    color: '#a82424',
                                                                    fontWeight: 700,
                                                                    padding: '0.4rem 0.5rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Usuń zdjęcie
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {(removedImagesByField[field.name] || []).length > 0 && (
                                            <div style={{ border: '1px dashed #d8e4f1', borderRadius: '8px', padding: '0.65rem', background: '#fff' }}>
                                                <p style={{ margin: '0 0 0.45rem', color: '#5c7086', fontSize: '0.82rem' }}>
                                                    Zdjęcia oznaczone do usunięcia (zapisz rekord, aby zatwierdzić):
                                                </p>
                                                <div style={{ display: 'grid', gap: '0.35rem' }}>
                                                    {(removedImagesByField[field.name] || []).map((imageUrl) => (
                                                        <button
                                                            key={`${field.name}-restore-${imageUrl}`}
                                                            type="button"
                                                            onClick={() => restoreRemovedImage(field.name, imageUrl)}
                                                            style={{
                                                                textAlign: 'left',
                                                                border: '1px solid #d6e2ef',
                                                                borderRadius: '6px',
                                                                padding: '0.35rem 0.55rem',
                                                                background: '#f7fbff',
                                                                color: '#214668',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cofnij usunięcie
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple={field.multiple}
                                    onChange={(e) => handleFileChange(e, field.name)}
                                    style={inputStyle}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#667', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                    Maksymalny rozmiar pliku: 50MB. {getSelectedFilesInfo(field.name)}
                                </p>
                            </>
                        ) : (
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                step={field.step}
                                style={inputStyle}
                            />
                        )}
                    </div>
                ))}

                {submitError && (
                    <p style={{ color: '#cf2e2e', marginBottom: '1rem' }}>
                        {submitError}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.7rem' }}>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Zapisz'}
                    </button>
                    <button type="button" onClick={onCancel} className="btn btnOutline">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
}


