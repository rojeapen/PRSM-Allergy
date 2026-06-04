import { ORIGIN, DEFAULT_COPY, type PRSM } from '../constants';
import Reveal from './reveal';
import './about.css';

function About({ prsm }: { prsm: PRSM }) {
    return (
        <section id="about" className="about section">
            <div className="cartographic" aria-hidden="true" />
            <div className="shell about-shell">
                <Reveal className="about-head">
                    <p className="kicker">{prsm.aboutKicker || DEFAULT_COPY.aboutKicker}</p>
                    <h2 className="about-title">{prsm.aboutTitle || DEFAULT_COPY.aboutTitle}</h2>
                    <p className="lede about-lede">{prsm.aboutSubtitle}</p>
                </Reveal>

                <ol className="path" aria-label="What we do">
                    {prsm.aboutTiles.map((tile, index) => (
                        <Reveal as="li" className="waypoint" key={index} delay={index * 110}>
                            <span className="waypoint-index" aria-hidden="true">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="waypoint-title">{tile.title}</h3>
                            <p className="waypoint-desc">{tile.description}</p>
                        </Reveal>
                    ))}
                </ol>

                <Reveal className="about-cta" delay={120}>
                    <button
                        className="btn-secondary"
                        onClick={() => (window.location.href = ORIGIN + 'Team/')}
                    >
                        Meet the people behind PRSM
                        <span className="btn-arrow" aria-hidden="true">→</span>
                    </button>
                </Reveal>
            </div>
        </section>
    );
}

export default About;
