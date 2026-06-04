import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './article-detail.css'
import Header from '../components/header';
import Footer from '../components/footer';
import Reveal from '../components/reveal';
import { PRSM, Article, ORIGIN } from '../constants';
import { getPRSM, getArticle } from '../api/db';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ArticleDetailPage />
    </StrictMode>,
)

type Status = 'loading' | 'found' | 'notfound';

function ArticleDetailPage() {
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [article, setArticle] = useState<Article | null>(null);
    const [status, setStatus] = useState<Status>('loading');

    useEffect(() => {
        getPRSM().then(data => setPrsm(data));

        const articleId = new URLSearchParams(window.location.search).get('id');
        if (!articleId) {
            setStatus('notfound');
            return;
        }
        getArticle(articleId)
            .then(data => {
                setArticle(data);
                setStatus(data ? 'found' : 'notfound');
            })
            .catch(() => setStatus('notfound'));
    }, []);

    if (status === 'loading') {
        return (
            <div className="loader-container" role="status" aria-label="Loading article">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <>
            <Header isArticlePage={true} />
            <main className="aread">
                {status === 'found' && article ? (
                    <div className="shell aread-shell">
                        <a className="aread-back" href={ORIGIN + 'Articles/'}>
                            <span aria-hidden="true">←</span> Back to articles
                        </a>

                        <header className="aread-head">
                            <p className="kicker">
                                <time dateTime={article.updatedAt}>{article.getDisplayDate()}</time>
                            </p>
                            <h1 className="aread-title">{article.title}</h1>
                        </header>

                        {article.mainImage && (
                            <Reveal className="aread-figure">
                                <div className="aread-frame">
                                    <img src={article.mainImage.url} alt={article.title} />
                                </div>
                            </Reveal>
                        )}

                        <article
                            className="aread-body"
                            dangerouslySetInnerHTML={{ __html: article.body }}
                        />

                        <footer className="aread-foot">
                            <a className="btn-secondary" href={ORIGIN + 'Articles/'}>
                                <span className="btn-arrow" aria-hidden="true">←</span>
                                All articles
                            </a>
                        </footer>
                    </div>
                ) : (
                    <div className="shell aread-notfound">
                        <p className="kicker">Article not found</p>
                        <h1 className="aread-notfound-title">
                            We couldn&rsquo;t find that article.
                        </h1>
                        <p className="aread-notfound-text">
                            It may have been removed, or the link is out of date.
                            Browse the latest pieces instead.
                        </p>
                        <a className="btn-primary" href={ORIGIN + 'Articles/'}>
                            See all articles
                            <span className="btn-arrow" aria-hidden="true">→</span>
                        </a>
                    </div>
                )}
            </main>
            {prsm && <Footer prsm={prsm} />}
        </>
    );
}

export default ArticleDetailPage;
