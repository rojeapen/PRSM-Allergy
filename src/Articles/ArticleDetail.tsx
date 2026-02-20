import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './article-detail.css'
import Header from '../components/header';
import Footer from '../components/footer';
import { PRSM, Article, ORIGIN } from '../constants';
import { getPRSM, getArticle } from '../api/db';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ArticleDetailPage />
    </StrictMode>,
)

function ArticleDetailPage() {
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        getPRSM().then(data => setPrsm(data));

        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('id');
        if (articleId) {
            getArticle(articleId).then(data => setArticle(data));
        }
    }, []);

    return (
        <>
            <Header isArticlePage={true} />
            <main className="article-detail-main">
                {article ? (
                    <>
                        <div className="article-detail-header">
                            <h1>{article.title}</h1>
                            <p className="article-date">{article.getDisplayDate()}</p>
                        </div>
                        <div className="article-detail-container">
                            <span className="article-back-link" onClick={() => window.location.href = ORIGIN + 'Articles/'}>
                                &larr; Back to Articles
                            </span>
                            <div className="article-detail-body"
                                dangerouslySetInnerHTML={{ __html: article.body }} />
                        </div>
                    </>
                ) : (
                    <div className="article-detail-loading">
                        <div className="loader"></div>
                        <p>Loading article...</p>
                    </div>
                )}
            </main>
            {prsm && <Footer prsm={prsm} />}
        </>
    );
}

export default ArticleDetailPage;
