import { ORIGIN, DEFAULT_COPY, type Event } from '../constants';
import Reveal from './reveal';
import './events.css';

function Events({ upcomingEvents, kicker, title, subtitle }: { upcomingEvents: Event[]; kicker?: string; title?: string; subtitle?: string }) {
    return (
        <section id="events" className="events section">
            <div className="cartographic" aria-hidden="true" />
            <div className="shell events-shell">
                <Reveal className="events-head">
                    <p className="kicker">{kicker || DEFAULT_COPY.eventsKicker}</p>
                    <h2 className="events-title">{title || DEFAULT_COPY.eventsTitle}</h2>
                    <p className="lede">
                        {subtitle || DEFAULT_COPY.eventsSubtitle}
                    </p>
                </Reveal>

                <ul className="agenda">
                    {upcomingEvents.map((event, i) => {
                        const time = event.getFormattedTime();
                        return (
                            <Reveal as="li" key={event.title + event.date} delay={i * 90}>
                                <a className="event-row" href={`${ORIGIN}Events/detail.html?id=${i}`}>
                                    <span className="event-when">
                                        <span className="event-when-marker" aria-hidden="true" />
                                        <time dateTime={event.date}>{event.displayDate}</time>
                                    </span>
                                    <span className="event-main">
                                        <span className="event-title">{event.title}</span>
                                        <span className="event-meta">
                                            {time && <span>{time}</span>}
                                            {time && event.location && <span className="event-dot" aria-hidden="true">·</span>}
                                            {event.location && <span>{event.location}</span>}
                                        </span>
                                    </span>
                                    <span className="event-go" aria-hidden="true">→</span>
                                </a>
                            </Reveal>
                        );
                    })}
                </ul>

                <Reveal className="events-cta" delay={80}>
                    <button
                        className="btn-secondary"
                        onClick={() => (window.location.href = ORIGIN + 'Events/')}
                    >
                        View all events
                        <span className="btn-arrow" aria-hidden="true">→</span>
                    </button>
                </Reveal>
            </div>
        </section>
    );
}

export default Events;
