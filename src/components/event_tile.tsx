import { ORIGIN, Event } from '../constants';
import './event_tile.css';

/**
 * An upcoming event as a horizontal media row. The whole row is one link
 * to the event's detail page, addressed by its index in prsm.events.
 */
function EventCard({ event, index }: { event: Event; index: number }) {
  const time = event.getFormattedTime();
  const hasPhoto = !!event.photoUrl?.trim();

  return (
    <a className="ecard" href={`${ORIGIN}Events/detail.html?id=${index}`}>
      <div className="ecard-media">
        {hasPhoto ? (
          <img
            src={event.photoUrl}
            alt={event.title}
            loading="lazy"
            decoding="async"
            style={{
              objectPosition: `${event.photoPosX}% ${event.photoPosY}%`,
              transformOrigin: `${event.photoPosX}% ${event.photoPosY}%`,
              ['--crop-zoom' as string]: event.photoZoom,
            } as React.CSSProperties}
          />
        ) : (
          <div className="ecard-media--blank" aria-hidden="true" />
        )}
      </div>

      <div className="ecard-body">
        <span className="ecard-when">
          <span className="ecard-when-marker" aria-hidden="true" />
          <time dateTime={event.date}>{event.displayDate}</time>
        </span>
        <h3 className="ecard-title">{event.title}</h3>
        <p className="ecard-desc">{event.description}</p>
        <span className="ecard-meta">
          {time && <span>{time}</span>}
          {time && event.location && <span className="ecard-dot" aria-hidden="true">·</span>}
          {event.location && <span>{event.location}</span>}
        </span>
      </div>

      <span className="ecard-go" aria-hidden="true">→</span>
    </a>
  );
}

export default EventCard;
