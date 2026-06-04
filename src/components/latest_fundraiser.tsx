import { ORIGIN, DEFAULT_COPY, type Fundraiser } from '../constants';
import Reveal from './reveal';
import './latest_fundraiser.css';

function LatestFundraiser({ featuredFundraiser, kicker }: { featuredFundraiser: Fundraiser; kicker?: string }) {
    return (
        <section id="fundraiser" className="fundraiser section">
            <div className="shell fundraiser-grid">
                <Reveal className="fundraiser-figure">
                    <div className="fundraiser-frame">
                        <img
                            src={featuredFundraiser.photo.url}
                            alt={featuredFundraiser.name}
                            loading="lazy"
                        />
                        <span className="fundraiser-mark" aria-hidden="true" />
                    </div>
                </Reveal>

                <Reveal className="fundraiser-content" delay={90}>
                    <p className="kicker">{kicker || DEFAULT_COPY.fundraiserKicker}</p>
                    <h2 className="fundraiser-name">{featuredFundraiser.name}</h2>
                    <p className="fundraiser-desc prose">{featuredFundraiser.description}</p>
                    <div className="fundraiser-actions">
                        <button
                            className="btn-primary"
                            onClick={() => window.open(featuredFundraiser.link, '_blank', 'noopener,noreferrer')}
                        >
                            Donate to this cause
                            <span className="btn-arrow" aria-hidden="true">↗</span>
                        </button>
                        <button
                            className="btn-link"
                            onClick={() => (window.location.href = ORIGIN + 'Fundraisers/')}
                        >
                            See all fundraisers
                            <span className="btn-arrow" aria-hidden="true">→</span>
                        </button>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export default LatestFundraiser;
