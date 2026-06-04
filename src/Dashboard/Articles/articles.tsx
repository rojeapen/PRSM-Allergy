import { StrictMode, useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./articles.css"
import {
    Panel,
    Field,
    EmptyState,
    SaveButton,
    SectionRail,
    DashboardSkeleton,
    useDashboardRail,
    type Section,
} from '../shell'
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { Article, Photo, PRSM } from '../../constants'
import { getArticlesFresh, createArticle, updateArticle, deleteArticle, uploadPhoto, deletePhoto, getPRSMFresh, updatePRSM } from '../../api/db'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

const SECTIONS: Section[] = [
    { id: 'subtitle', label: 'Subtitle' },
    { id: 'articles', label: 'Articles' },
]

class ArticleEdit {
    id?: string;
    title: string;
    body: string;
    mainImageFile?: File;
    mainImageUrl?: string;
    mainImageId?: string;

    constructor(params: { id?: string; title: string; body: string; mainImageFile?: File; mainImageUrl?: string; mainImageId?: string }) {
        this.id = params.id;
        this.title = params.title;
        this.body = params.body;
        this.mainImageFile = params.mainImageFile;
        this.mainImageUrl = params.mainImageUrl;
        this.mainImageId = params.mainImageId;
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
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [subtitle, setSubtitle] = useState('');
    const [canSaveSubtitle, setCanSaveSubtitle] = useState(false);
    const [loadingSaveSubtitle, setLoadingSaveSubtitle] = useState(false);

    const { activeSection, goToSection } = useDashboardRail(SECTIONS, !loading);

    useEffect(() => {
        isUserLoggedIn(() => { });
        getArticlesFresh().then((data) => {
            setArticles(data);
            setLoading(false);
        });
        getPRSMFresh().then((data) => {
            if (data) {
                setPrsm(data);
                setSubtitle(data.articlesSubtitle || '');
            }
        });
    }, []);

    const handleSubtitleChange = (val: string) => {
        setSubtitle(val);
        setCanSaveSubtitle(true);
    };

    const saveSubtitle = async () => {
        if (!prsm) return;
        setLoadingSaveSubtitle(true);
        prsm.articlesSubtitle = subtitle;
        await updatePRSM(prsm);
        setCanSaveSubtitle(false);
        setLoadingSaveSubtitle(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    const refreshArticles = async () => {
        const data = await getArticlesFresh();
        setArticles(data);
    };

    const handleAddArticle = async () => {
        if (!newArticle.title.trim() || !newArticle.body.trim()) return;
        setLoadingSave(true);
        const now = new Date().toISOString();
        let mainImage: Photo | undefined;
        if (newArticle.mainImageFile) {
            mainImage = await uploadPhoto(newArticle.mainImageFile, `Article_${newArticle.title}_${Date.now()}`);
        }
        const article = new Article({
            id: '',
            title: newArticle.title,
            body: newArticle.body,
            createdAt: now,
            updatedAt: now,
            mainImage,
        });
        await createArticle(article);
        await refreshArticles();
        setNewArticle(new ArticleEdit({ title: '', body: '' }));
        setLoadingSave(false);
    };

    const handleEditArticle = (article: Article) => {
        setEditingId(article.id);
        setEditingArticle(new ArticleEdit({
            id: article.id,
            title: article.title,
            body: article.body,
            mainImageUrl: article.mainImage?.url,
            mainImageId: article.mainImage?.id,
        }));
    };

    const handleSaveArticle = async () => {
        if (!editingArticle || !editingId) return;
        setLoadingSave(true);
        const now = new Date().toISOString();
        const original = articles.find(a => a.id === editingId);

        let mainImage: Photo | undefined = original?.mainImage;

        if (editingArticle.mainImageFile) {
            if (original?.mainImage) {
                await deletePhoto(original.mainImage);
            }
            mainImage = await uploadPhoto(editingArticle.mainImageFile, `Article_${editingArticle.title}_${Date.now()}`);
        } else if (!editingArticle.mainImageUrl && original?.mainImage) {
            await deletePhoto(original.mainImage);
            mainImage = undefined;
        }

        const updated = new Article({
            id: editingId,
            title: editingArticle.title,
            body: editingArticle.body,
            createdAt: original?.createdAt || now,
            updatedAt: now,
            mainImage,
        });
        await updateArticle(editingId, updated);
        await refreshArticles();
        setEditingId(null);
        setEditingArticle(null);
        setLoadingSave(false);
    };

    const handleDeleteArticle = async (id: string) => {
        setLoadingSave(true);
        const article = articles.find(a => a.id === id);
        if (article?.mainImage) {
            await deletePhoto(article.mainImage);
        }
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
            <main className="dash">
                <div className="dash-head">
                    <p className="kicker">Site content</p>
                    <h1>Articles</h1>
                    <p className="dash-head-sub">
                        The subtitle on the Articles page and every published article. Each
                        article saves on its own as you add, edit, or delete it.
                    </p>
                </div>

                {loading ? (
                    <DashboardSkeleton sections={SECTIONS} panels={2} />
                ) : (
                    <>
                        <SectionRail
                            sections={SECTIONS}
                            activeSection={activeSection}
                            goToSection={goToSection}
                        />

                        <div className="dash-main">
                            {/* ---- Subtitle ---- */}
                            <Panel
                                id="subtitle"
                                title="Page subtitle"
                                desc='The supporting line under the "Articles" heading.'
                                action={
                                    <SaveButton
                                        dirty={canSaveSubtitle}
                                        loading={loadingSaveSubtitle}
                                        onClick={saveSubtitle}
                                        label="Save subtitle"
                                    />
                                }
                            >
                                <Field label="Subtitle" htmlFor="articles-subtitle">
                                    <textarea
                                        id="articles-subtitle"
                                        className="field"
                                        value={subtitle}
                                        onChange={e => handleSubtitleChange(e.target.value)}
                                    />
                                </Field>
                            </Panel>

                            {/* ---- Articles ---- */}
                            <Panel
                                id="articles"
                                title="Articles"
                                desc="Create, edit, and publish articles. Changes save immediately."
                                action={
                                    loadingSave ? (
                                        <span className="saving-inline">
                                            <span className="spinner-sm is-dark" aria-hidden="true" />
                                            Saving…
                                        </span>
                                    ) : undefined
                                }
                            >
                                {articles.length === 0 ? (
                                    <EmptyState>No articles yet. Write your first one below.</EmptyState>
                                ) : (
                                    <div className="art-list">
                                        {articles.map((article) =>
                                            editingId === article.id ? (
                                                <div className="art-item is-editing" key={article.id}>
                                                    <div className="art-edit-fields">
                                                        <Field label="Title">
                                                            <input
                                                                type="text"
                                                                className="field"
                                                                value={editingArticle?.title || ''}
                                                                onChange={e => setEditingArticle(new ArticleEdit({ ...editingArticle!, title: e.target.value }))}
                                                            />
                                                        </Field>
                                                        <Field label="Main image">
                                                            <div className="art-image-field">
                                                                {(editingArticle?.mainImageFile || editingArticle?.mainImageUrl) && (
                                                                    <div className="art-image-preview">
                                                                        <img
                                                                            src={editingArticle.mainImageFile ? URL.createObjectURL(editingArticle.mainImageFile) : editingArticle.mainImageUrl}
                                                                            alt="Preview"
                                                                        />
                                                                        <button
                                                                            className="btn-quiet is-danger"
                                                                            onClick={() => setEditingArticle(new ArticleEdit({ ...editingArticle!, mainImageFile: undefined, mainImageUrl: undefined, mainImageId: undefined }))}
                                                                        >
                                                                            Remove image
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="field-file"
                                                                    onChange={(e) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            setEditingArticle(new ArticleEdit({ ...editingArticle!, mainImageFile: e.target.files[0] }));
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </Field>
                                                        <Field label="Body">
                                                            <RichTextEditor
                                                                key={`edit-${article.id}`}
                                                                value={editingArticle?.body || ''}
                                                                onChange={(html) => setEditingArticle(new ArticleEdit({ ...editingArticle!, body: html }))}
                                                            />
                                                        </Field>
                                                    </div>
                                                    <div className="row-actions">
                                                        <button className="btn-quiet" onClick={handleSaveArticle}>Save</button>
                                                        <button className="btn-quiet" onClick={handleCancelEdit}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="art-item" key={article.id}>
                                                    <div className="art-main">
                                                        {article.mainImage?.url && (
                                                            <img className="art-thumb" src={article.mainImage.url} alt={article.title} />
                                                        )}
                                                        <div className="art-info">
                                                            <span className="row-title">{article.title}</span>
                                                            <span className="art-meta">{article.getDisplayDate()}</span>
                                                            <span className="art-excerpt">{getExcerpt(article.body)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="row-actions">
                                                        <button className="btn-quiet" onClick={() => handleEditArticle(article)}>Edit</button>
                                                        <button className="btn-quiet is-danger" onClick={() => handleDeleteArticle(article.id)}>Delete</button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                <div className="art-add">
                                    <h3 className="art-add-title">Create article</h3>
                                    <Field label="Title">
                                        <input
                                            type="text"
                                            className="field"
                                            placeholder="Article title"
                                            value={newArticle.title}
                                            onChange={e => setNewArticle(new ArticleEdit({ ...newArticle, title: e.target.value }))}
                                        />
                                    </Field>
                                    <Field label="Main image">
                                        <div className="art-image-field">
                                            {newArticle.mainImageFile && (
                                                <div className="art-image-preview">
                                                    <img src={URL.createObjectURL(newArticle.mainImageFile)} alt="Preview" />
                                                    <button
                                                        className="btn-quiet is-danger"
                                                        onClick={() => setNewArticle(new ArticleEdit({ ...newArticle, mainImageFile: undefined }))}
                                                    >
                                                        Remove image
                                                    </button>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="field-file"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setNewArticle(new ArticleEdit({ ...newArticle, mainImageFile: e.target.files[0] }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Body">
                                        <RichTextEditor
                                            key="new-article"
                                            value={newArticle.body}
                                            onChange={(html) => setNewArticle(new ArticleEdit({ ...newArticle, body: html }))}
                                        />
                                    </Field>
                                    <div>
                                        <button className="btn-quiet" onClick={handleAddArticle}>Add article</button>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}

export default App
