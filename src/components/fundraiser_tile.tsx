import { Fundraiser } from '../constants';
import './fundraiser_tile.css';

/**
 * A single giving opportunity in the fundraisers grid. The whole card is
 * clickable via a stretched link on the Donate action, so there is exactly
 * one link per card (no nested interactive elements).
 */
function FundraiserCard({ fundraiser }: { fundraiser: Fundraiser }) {
  const hasPhoto = !!fundraiser.photo?.url?.trim();

  return (
    <article className="fcard">
      <div className="fcard-media">
        {hasPhoto ? (
          <img
            src={fundraiser.photo.url}
            alt={fundraiser.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="fcard-media--blank" aria-hidden="true" />
        )}
        {fundraiser.isFeatured && <span className="fcard-badge">Featured</span>}
      </div>

      <div className="fcard-body">
        <h3 className="fcard-name">{fundraiser.name}</h3>
        <p className="fcard-desc">{fundraiser.description}</p>
        <a
          className="btn-secondary fcard-cta"
          href={fundraiser.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Donate to ${fundraiser.name}`}
        >
          Donate
          <span className="btn-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default FundraiserCard;
