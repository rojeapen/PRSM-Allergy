import './Articles.css';

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';
import Footer from '../components/footer';
import { PRSM, Article, ORIGIN } from '../constants';
import { getPRSM, getArticles } from '../api/db';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ArticlesPage />
    </StrictMode>,
)

function ArticlesPage() {
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(true);

    useEffect(() => {
        getPRSM().then(data => setPrsm(data));
        getArticles().then(data => {
            setArticles(data);
            setLoadingArticles(false);
        });
    }, []);

    const getExcerpt = (html: string, maxLength: number = 150): string => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        prsm ?
            <>
                <Header isArticlePage={true} />
                <main className="articles-page">
                    <div className="page-hero">
                        <h1 className="page-title">Articles</h1>
                        <p className="page-subtitle">Stay informed with the latest updates, research insights, and community stories from PRSM Allergy.</p>
                    </div>

                    {loadingArticles ? (
                        <div className="articles-loading">
                            <div className="loader"></div>
                        </div>
                    ) : articles.length > 0 ? (
                        <div className="articles-list">
                            {articles.map((article) => (
                                <div className="article-card" key={article.id}
                                    onClick={() => { window.location.href = ORIGIN + `Articles/detail.html?id=${article.id}`; }}>
                                    <div className="article-card-content">
                                        <p className="article-card-date">{article.getDisplayDate()}</p>
                                        <h3 className="article-card-title">{article.title}</h3>
                                        <p className="article-card-excerpt">{getExcerpt(article.body)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="articles-empty">
                            <p>Articles coming soon!</p>
                        </div>
                    )}
                </main>
                <Footer prsm={prsm} />
            </> : <>
                <div className='loader-container'><div className='loader'></div></div>
            </>
    );
}

export default ArticlesPage;
