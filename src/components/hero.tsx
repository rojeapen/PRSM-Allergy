import { useEffect, useState } from "react";
import { ORIGIN, DEFAULT_COPY, type PRSM } from "../constants";
import { scrollToId } from "../lib/scroll";
import "./hero.css";

const Hero = ({
  prsm,
  hasFeaturedFundraiser,
}: {
  prsm: PRSM;
  hasFeaturedFundraiser: boolean;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={`hero${mounted ? " is-mounted" : ""}`} id="top">
      <div className="cartographic" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="shell hero-grid">
        <div className="hero-content">
          <p
            className="kicker hero-rise"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            {prsm.heroKicker || DEFAULT_COPY.heroKicker}
          </p>

          <h1
            className="hero-title hero-rise"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {prsm.landingPageTitle}
          </h1>

          <p
            className="hero-lede hero-rise"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {prsm.landingPageSubtitle}
          </p>

          <div
            className="hero-actions hero-rise"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <button
              className="btn-primary"
              onClick={() => {
                window.location.href = ORIGIN + "Fundraisers/";
              }}
            >
              Donate now
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          <p
            className="hero-note hero-rise"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <span className="hero-note-marker" aria-hidden="true" />
            {prsm.heroNote || DEFAULT_COPY.heroNote}
          </p>
        </div>

        <div
          className="hero-figure hero-rise"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <div className="hero-frame">
            <img
              src={prsm.landingPagePhoto.url}
              alt="PRSM Allergy Foundation"
              width={520}
              height={620}
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
