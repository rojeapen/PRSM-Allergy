import "./Articles.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import Header from "../components/header";
import Footer from "../components/footer";
import Reveal from "../components/reveal";
import { PRSM, Article, ORIGIN } from "../constants";
import { getPRSM, getArticles } from "../api/db";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArticlesPage />
  </StrictMode>,
);

const DEFAULT_SUBTITLE =
  "Research updates, practical guidance, and stories from the allergy community, written to keep you informed.";

/** Strip HTML to a plain-text excerpt of at most maxLength characters. */
function getExcerpt(html: string, maxLength: number = 160): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = (div.textContent || div.innerText || "")
    .trim()
    .replace(/\s+/g, " ");
  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + "…"
    : text;
}

function articleHref(id: string): string {
  return ORIGIN + `Articles/detail.html?id=${id}`;
}

function ArticlesPage() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    getPRSM().then((data) => setPrsm(data));
    getArticles().then((data) => {
      setArticles(data);
      setLoadingArticles(false);
    });
  }, []);

  if (!prsm) {
    return (
      <div className="loader-container" role="status" aria-label="Loading">
        <div className="loader"></div>
      </div>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <>
      <Header isArticlePage={true} />
      <main className="articles-page">
        {/* ---- Hero ---- */}
        <section className="art-hero section" aria-labelledby="art-hero-title">
          <div className="shell art-hero-shell">
            <Reveal className="art-hero-head">
              <p className="kicker">From PRSM</p>
              <h1 id="art-hero-title" className="art-hero-title">
                Articles
              </h1>
              <p className="lede art-hero-lede">
                {prsm.articlesSubtitle?.trim() || DEFAULT_SUBTITLE}
              </p>
            </Reveal>
          </div>
        </section>

        {loadingArticles ? (
          <div
            className="art-loading"
            role="status"
            aria-label="Loading articles"
          >
            <div className="loader"></div>
          </div>
        ) : articles.length === 0 ? (
          <section className="section">
            <div className="shell">
              <div className="art-empty">
                <p className="art-empty-title">No articles yet.</p>
                <p className="art-empty-text">
                  We&rsquo;re working on the first pieces. Check back soon for
                  research updates and community stories.
                </p>
                <a className="btn-secondary" href={ORIGIN}>
                  Back to home
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ---- Latest article, as a lead ---- */}
            <section
              className="art-featured section"
              aria-labelledby="art-featured-title"
            >
              <div className="shell">
                <Reveal>
                  <a
                    className={`art-lead ${featured.mainImage ? "" : "art-lead--textonly"}`}
                    href={articleHref(featured.id)}
                  >
                    {featured.mainImage && (
                      <div className="art-lead-media">
                        <img
                          src={featured.mainImage.url}
                          alt={featured.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className="art-lead-body">
                      <p className="kicker">
                        Latest
                        <span className="art-lead-date">
                          <time dateTime={featured.updatedAt}>
                            {featured.getDisplayDate()}
                          </time>
                        </span>
                      </p>
                      <h2 id="art-featured-title" className="art-lead-title">
                        {featured.title}
                      </h2>
                      <p className="art-lead-excerpt">
                        {getExcerpt(featured.body, 240)}
                      </p>
                      <span className="art-lead-cta">
                        Read article
                        <span className="btn-arrow" aria-hidden="true">
                          →
                        </span>
                      </span>
                    </div>
                  </a>
                </Reveal>
              </div>
            </section>

            {/* ---- The rest, as an editorial index ---- */}
            {rest.length > 0 && (
              <section
                className="art-index section"
                aria-labelledby="art-index-title"
              >
                <div className="shell">
                  <Reveal className="art-index-head">
                    <h2 id="art-index-title" className="art-index-title">
                      More articles
                    </h2>
                  </Reveal>
                  <ul className="art-list">
                    {rest.map((article, i) => (
                      <Reveal as="li" key={article.id} delay={i * 60}>
                        <a className="art-row" href={articleHref(article.id)}>
                          <div className="art-row-main">
                            <p className="art-row-date">
                              <time dateTime={article.updatedAt}>
                                {article.getDisplayDate()}
                              </time>
                            </p>
                            <h3 className="art-row-title">{article.title}</h3>
                            <p className="art-row-excerpt">
                              {getExcerpt(article.body)}
                            </p>
                          </div>
                          {article.mainImage && (
                            <div className="art-row-thumb">
                              <img
                                src={article.mainImage.url}
                                alt={article.title}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                          <span className="art-row-go" aria-hidden="true">
                            →
                          </span>
                        </a>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default ArticlesPage;
