import { StrictMode, useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./articles.css"
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { Article } from '../../constants'
import { getArticlesFresh, createArticle, updateArticle, deleteArticle } from '../../api/db'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

class ArticleEdit {
    id?: string;
    title: string;
    body: string;

    constructor(params: { id?: string; title: string; body: string }) {
        this.id = params.id;
        this.title = params.title;
        this.body = params.body;
    }
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, val?: string) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div>
            <div className="rich-text-toolbar">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} title="Bold">
                    <b>B</b>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} title="Italic">
                    <i>I</i>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} title="Underline">
                    <u>U</u>
                </button>
                <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const sel = window.getSelection();
                    const hasLink = sel && sel.rangeCount > 0 && sel.anchorNode?.parentElement?.closest('a');
                    if (hasLink) {
                        execCmd('unlink');
                    } else {
                        const url = prompt('Enter URL:');
                        if (url) {
                            execCmd('createLink', url);
                            const sel = window.getSelection();
                            if (sel && sel.anchorNode) {
                                const anchor = sel.anchorNode.parentElement?.closest('a') || sel.anchorNode.parentElement;
                                if (anchor && anchor.tagName === 'A') {
                                    (anchor as HTMLAnchorElement).target = '_blank';
                                    (anchor as HTMLAnchorElement).rel = 'noopener noreferrer';
                                }
                            }
                            handleInput();
                        }
                    }
                }} title="Insert Link">
                    🔗
                </button>
                <select
                    onChange={(e) => { execCmd('fontSize', e.target.value); }}
                    defaultValue="3"
                    title="Font Size"
                >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>
            </div>
            <div
                ref={editorRef}
                className="rich-text-editor"
                contentEditable
                onInput={handleInput}
            />
        </div>
    );
}

function App() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [newArticle, setNewArticle] = useState<ArticleEdit>(new ArticleEdit({ title: '', body: '' }));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingArticle, setEditingArticle] = useState<ArticleEdit | null>(null);

    useEffect(() => {
        isUserLoggedIn(() => { });
        getArticlesFresh().then((data) => {
            setArticles(data);
            setLoading(false);
        });
    }, []);

    const refreshArticles = async () => {
        const data = await getArticlesFresh();
        setArticles(data);
    };

    const handleAddArticle = async () => {
        if (!newArticle.title.trim() || !newArticle.body.trim()) return;
        setLoadingSave(true);
        const now = new Date().toISOString();
        const article = new Article({
            id: '',
            title: newArticle.title,
            body: newArticle.body,
            createdAt: now,
            updatedAt: now,
        });
        await createArticle(article);
        await refreshArticles();
        setNewArticle(new ArticleEdit({ title: '', body: '' }));
        setLoadingSave(false);
    };

    const handleEditArticle = (article: Article) => {
        setEditingId(article.id);
        setEditingArticle(new ArticleEdit({ id: article.id, title: article.title, body: article.body }));
    };

    const handleSaveArticle = async () => {
        if (!editingArticle || !editingId) return;
        setLoadingSave(true);
        const now = new Date().toISOString();
        const original = articles.find(a => a.id === editingId);
        const updated = new Article({
            id: editingId,
            title: editingArticle.title,
            body: editingArticle.body,
            createdAt: original?.createdAt || now,
            updatedAt: now,
        });
        await updateArticle(editingId, updated);
        await refreshArticles();
        setEditingId(null);
        setEditingArticle(null);
        setLoadingSave(false);
    };

    const handleDeleteArticle = async (id: string) => {
        setLoadingSave(true);
        await deleteArticle(id);
        await refreshArticles();
        if (editingId === id) {
            setEditingId(null);
            setEditingArticle(null);
        }
        setLoadingSave(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingArticle(null);
    };

    const getExcerpt = (html: string, maxLength: number = 120): string => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <>
            <Header isDashboardArticlesPage={true} />
            {!loading ? (
                <section className="dashboard-section light">
                    <div className="section-title">
                        <h1>Articles</h1>
                        <p>Create, edit, and manage articles.</p>
                    </div>
                    <div className="articles-dashboard-content">
                        <div className="articles-dashboard-list">
                            {articles.length === 0 && <div style={{ textAlign: 'center' }}>No articles yet.</div>}
                            {articles.map((article) => (
                                <div className="articles-dashboard-item" key={article.id}>
                                    {editingId === article.id ? (
                                        <>
                                            <div className="article-form-group">
                                                <label>Title:</label>
                                                <input
                                                    type="text"
                                                    className="input-light"
                                                    value={editingArticle?.title || ''}
                                                    onChange={e => setEditingArticle(new ArticleEdit({ ...editingArticle!, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="article-form-group">
                                                <label>Body:</label>
                                                <RichTextEditor
                                                    key={`edit-${article.id}`}
                                                    value={editingArticle?.body || ''}
                                                    onChange={(html) => setEditingArticle(new ArticleEdit({ ...editingArticle!, body: html }))}
                                                />
                                            </div>
                                            <div className="articles-dashboard-actions">
                                                <button className="btn-primary" onClick={handleSaveArticle}>Save</button>
                                                <button className="btn-danger" onClick={handleCancelEdit}>Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="articles-dashboard-item-preview">
                                                <div className="articles-dashboard-item-info">
                                                    <h4>{article.title}</h4>
                                                    <p style={{ color: '#0A6C95', fontWeight: 600 }}>
                                                        {article.getDisplayDate()}
                                                    </p>
                                                    <p>{getExcerpt(article.body)}</p>
                                                </div>
                                            </div>
                                            <div className="articles-dashboard-actions">
                                                <button className="btn-primary" onClick={() => handleEditArticle(article)}>Edit</button>
                                                <button className="btn-danger" onClick={() => handleDeleteArticle(article.id)}>Delete</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="articles-dashboard-add">
                            <h3 style={{ margin: '0 0 1rem 0' }}>Create New Article</h3>
                            <div className="article-form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    className="input-light"
                                    placeholder="Article title"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle(new ArticleEdit({ ...newArticle, title: e.target.value }))}
                                />
                            </div>
                            <div className="article-form-group">
                                <label>Body:</label>
                                <RichTextEditor
                                    key="new-article"
                                    value={newArticle.body}
                                    onChange={(html) => setNewArticle(new ArticleEdit({ ...newArticle, body: html }))}
                                />
                            </div>
                            <button className="btn-primary" onClick={handleAddArticle}>Add Article</button>
                        </div>

                        {loadingSave && <div className="loader"></div>}
                    </div>
                </section>
            ) : (
                <div className="loader-container"><div className="loader"></div></div>
            )}
        </>
    );
}

export default App
