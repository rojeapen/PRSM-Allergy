import "./Fundraisers.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import Header from "../components/header";

import FundraiserCard from "../components/fundraiser_tile";
import { DEFAULT_COPY, ORIGIN, PRSM } from "../constants";
import Footer from "../components/footer";
import Reveal from "../components/reveal";
import { getPRSM } from "../api/db";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fundraisers />
  </StrictMode>,
);

const DEFAULT_SUBTITLE =
  "Every campaign supports allergy and immunology research and the people who depend on it. Pick a cause and give in a few minutes.";

function Fundraisers() {
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

  const fundraisers = prsm.fundraisers;
  console.log("Loaded fundraisers:", fundraisers);
  const featured = fundraisers.find((f) => f.isFeatured);
  const others = featured
    ? fundraisers.filter((f) => f !== featured)
    : fundraisers;
  const hasAny = fundraisers.length > 0;

  return (
    <>
      <Header isFundraiserPage={true} />
      <main className="fund-page">
        {/* ---- Hero ---- */}
        <section
          className="fund-hero section"
          aria-labelledby="fund-hero-title"
        >
          <div className="shell fund-hero-shell">
            <Reveal className="fund-hero-head">
              <p className="kicker">Support our work</p>
              <h1 id="fund-hero-title" className="fund-hero-title">
                Fund the research
              </h1>
              <p className="lede fund-hero-lede">
                {prsm.fundraisersSubtitle?.trim() || DEFAULT_SUBTITLE}
              </p>
            </Reveal>
          </div>
        </section>

        {!hasAny ? (
          /* ---- Empty: no fundraisers at all ---- */
          <section className="fund-empty-section section">
            <div className="shell">
              <div className="fund-empty">
                <p className="fund-empty-title">
                  No active fundraisers right now.
                </p>
                <p className="fund-empty-text">
                  New giving campaigns are on the way. Until then, the research
                  continues, and there are other ways to be part of it.
                </p>
                <a className="btn-secondary" href={ORIGIN + "Events/"}>
                  See upcoming events
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ---- Featured lead ---- */}
            {featured && (
              <section
                className="fund-featured section"
                aria-labelledby="fund-featured-name"
              >
                <div className="shell fund-featured-grid">
                  <Reveal className="fund-featured-figure">
                    <div className="fund-featured-frame">
                      {featured.photo?.url?.trim() ? (
                        <img src={featured.photo.url} alt={featured.name} />
                      ) : (
                        <div
                          className="fund-featured-frame--blank"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </Reveal>
                  <Reveal className="fund-featured-content" delay={90}>
                    <p className="kicker">Featured fundraiser</p>
                    <h2 id="fund-featured-name" className="fund-featured-name">
                      {featured.name}
                    </h2>
                    <p className="fund-featured-desc prose">
                      {featured.description}
                    </p>
                    <a
                      className="btn-primary"
                      href={featured.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Donate to this cause
                    </a>
                  </Reveal>
                </div>
              </section>
            )}

            {/* ---- The grid of remaining fundraisers ---- */}
            {others.length > 0 && (
              <section
                id="fund-list"
                className="fund-list section"
                aria-labelledby="fund-list-title"
              >
                <div className="shell">
                  <Reveal className="fund-list-head">
                    <p className="kicker">Ways to give</p>
                    <h2 id="fund-list-title" className="fund-list-title">
                      {featured ? "More fundraisers" : "Open fundraisers"}
                    </h2>
                  </Reveal>
                  <ul className="fund-grid">
                    {others.map((fundraiser, index) => (
                      <Reveal as="li" key={index} delay={(index % 3) * 80}>
                        <FundraiserCard fundraiser={fundraiser} />
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}

        {/* ---- The pledge: where every donation goes ---- */}
        <section
          className="fund-pledge section"
          aria-labelledby="fund-pledge-title"
        >
          <div className="shell fund-pledge-shell">
            <Reveal className="fund-pledge-copy">
              <p className="kicker">Our promise</p>
              <h2 id="fund-pledge-title" className="fund-pledge-title">
                {prsm.fundraiserPledgeTitle?.trim() ||
                  DEFAULT_COPY.fundraiserPledgeTitle}
              </h2>
              <p className="fund-pledge-text">
                {prsm.fundraiserPledgeText?.trim() ||
                  DEFAULT_COPY.fundraiserPledgeText}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default Fundraisers;
