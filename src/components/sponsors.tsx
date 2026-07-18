import Reveal from "./reveal";
import type { PRSM } from "../constants";
import "./sponsors.css";

const SponsorStrip = ({ prsm }: { prsm: PRSM }) => {
  return (
    <section className="sponsor-strip" aria-label="Our sponsors">
      <div className="shell sponsor-strip-inner">
        <Reveal className="sponsor-strip-label" as="p">
          <span className="kicker">Our sponsors</span>
        </Reveal>
        <span className="sponsor-strip-divider" aria-hidden="true" />
        <Reveal className="sponsor-strip-row" delay={80}>
          {prsm.sponsors.map((sponsor, idx) => (
            <span
              className="sponsor-chip"
              key={sponsor.photo.id || idx}
              onClick={() => window.open(sponsor.link, "_blank")}
            >
              <img
                className="sponsor-logo"
                src={sponsor.photo.url}
                alt="Sponsor logo"
                loading="lazy"
                decoding="async"
              />
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default SponsorStrip;
