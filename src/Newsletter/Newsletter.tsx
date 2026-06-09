import './newsletter-page.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import Logo from '../assets/favicon.svg';
import { ORIGIN, PRSM } from '../constants';
import { getPRSM } from '../api/db';
import Newsletter from '../components/newsletter';
import Footer from '../components/footer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NewsletterPage />
  </StrictMode>,
);

function NewsletterPage() {
  const [prsm, setPrsm] = useState<PRSM | null>(null);

  useEffect(() => {
    getPRSM().then((data) => setPrsm(data));
  }, []);

  if (!prsm) {
    return (
      <div className="loader-container" role="status" aria-label="Loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="np-page">
      {/* Minimal chrome: logo + back to site, no nav, no competing CTA. */}
      <header className="np-bar">
        <a className="np-brand" href={ORIGIN} aria-label="PRSM Allergy Foundation, home">
          <img src={Logo} alt="" className="np-brand-logo" />
          <span className="np-brand-name">PRSM Allergy Foundation</span>
        </a>
        <a className="np-back" href={ORIGIN}>
          <span className="np-back-arrow" aria-hidden="true">&larr;</span>
          Back to site
        </a>
      </header>

      {/* The same newsletter section as the landing page, with the same dynamic copy. */}
      <main className="np-main">
        <Newsletter
          kicker={prsm.newsletterKicker}
          title={prsm.newsletterTitle}
          subtitle={prsm.newsletterSubtitle}
        />
      </main>

      <Footer prsm={prsm} />
    </div>
  );
}

export default NewsletterPage;
