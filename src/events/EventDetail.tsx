import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './event-detail.css'
import Header from '../components/header';
import Footer from '../components/footer';
import Reveal from '../components/reveal';
import { ORIGIN, PRSM } from '../constants';
import { getPRSM } from '../api/db';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <EventDetailPage />
    </StrictMode>,
)

function idFromUrl(): number {
    const raw = new URLSearchParams(window.location.search).get('id');
    const n = raw !== null ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) ? -1 : n;
}

function EventDetailPage() {
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [eventIndex, setEventIndex] = useState<number | null>(null);

    useEffect(() => {
        getPRSM().then((data) => {
            setPrsm(data);
            if (data) {
                const idx = idFromUrl();
                setEventIndex(idx >= 0 && idx < data.events.length ? idx : null);
            }
        });
    }, []);

    // Keep the view in sync with browser back/forward.
    useEffect(() => {
        const onPop = () => {
            if (!prsm) return;
            const idx = idFromUrl();
            setEventIndex(idx >= 0 && idx < prsm.events.length ? idx : null);
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [prsm]);

    const goToIndex = (idx: number) => {
        setEventIndex(idx);
        window.history.pushState(null, '', `?id=${idx}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!prsm) {
        return (
            <div className="loader-container" role="status" aria-label="Loading">
                <div className="loader"></div>
            </div>
        );
    }

    const event = eventIndex !== null ? prsm.events[eventIndex] : null;

    if (!event) {
        return (
            <>
                <Header isEventPage={true} />
                <main className="edetail">
                    <div className="shell edetail-notfound">
                        <p className="kicker">Event not found</p>
                        <h1 className="edetail-notfound-title">
                            We couldn&rsquo;t find that event.
                        </h1>
                        <p className="edetail-notfound-text">
                            It may have been removed, or the link is out of date.
                            Browse what&rsquo;s coming up instead.
                        </p>
                        <a className="btn-primary" href={ORIGIN + 'Events/'}>
                            See all events
                            <span className="btn-arrow" aria-hidden="true">→</span>
                        </a>
                    </div>
                </main>
                <Footer prsm={prsm} />
            </>
        );
    }

    const total = prsm.events.length;
    const time = event.getFormattedTime();
    const hasPhoto = !!event.photoUrl?.trim();
    const others = prsm.events
        .map((e, i) => ({ e, i }))
        .filter((x) => x.i !== eventIndex);
    const prevIndex = (eventIndex! - 1 + total) % total;
    const nextIndex = (eventIndex! + 1) % total;

    return (
        <>
            <Header isEventPage={true} />
            <main className="edetail">
                <div className="shell edetail-shell">

                    <a className="edetail-back" href={ORIGIN + 'Events/'}>
                        <span aria-hidden="true">←</span> All events
                    </a>

                    <header className="edetail-head">
                        <p className="kicker">
                            <time dateTime={event.date}>{event.displayDate}</time>
                        </p>
                        <h1 className="edetail-title">{event.title}</h1>
                        <div className="edetail-facts">
                            {time && <span className="edetail-fact">{time}</span>}
                            {time && event.location && (
                                <span className="edetail-fact-dot" aria-hidden="true">·</span>
                            )}
                            {event.location && <span className="edetail-fact">{event.location}</span>}
                        </div>
                    </header>

                    <Reveal className="edetail-figure">
                        <div className="edetail-frame">
                            {hasPhoto ? (
                                <img
                                    src={event.photoUrl}
                                    alt={event.title}
                                    className="edetail-image"
                                    style={{
                                        objectPosition: `${event.photoPosX}% ${event.photoPosY}%`,
                                        transform: `scale(${event.photoZoom})`,
                                        transformOrigin: `${event.photoPosX}% ${event.photoPosY}%`,
                                    }}
                                />
                            ) : (
                                <div className="edetail-frame--blank" aria-hidden="true" />
                            )}
                        </div>
                    </Reveal>

                    <div className="edetail-grid">
                        <article className="edetail-body">
                            <h2 className="edetail-subhead">About this event</h2>
                            <p className="edetail-desc">{event.description}</p>
                        </article>

                        <aside className="edetail-aside">
                            <div className="edetail-panel">
                                <h2 className="edetail-panel-title">Event details</h2>
                                <dl className="edetail-dl">
                                    <div className="edetail-dl-row">
                                        <dt>Date</dt>
                                        <dd><time dateTime={event.date}>{event.displayDate}</time></dd>
                                    </div>
                                    {time && (
                                        <div className="edetail-dl-row">
                                            <dt>Time</dt>
                                            <dd>{time}</dd>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="edetail-dl-row">
                                            <dt>Location</dt>
                                            <dd>{event.location}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {others.length > 0 && (
                                <div className="edetail-panel">
                                    <h2 className="edetail-panel-title">Other events</h2>
                                    <ul className="edetail-others">
                                        {others.map(({ e, i }) => (
                                            <li key={i}>
                                                <button
                                                    type="button"
                                                    className="edetail-other"
                                                    onClick={() => goToIndex(i)}
                                                >
                                                    <time className="edetail-other-date" dateTime={e.date}>
                                                        {e.displayDate}
                                                    </time>
                                                    <span className="edetail-other-title">{e.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    </div>

                    {total > 1 && (
                        <nav className="edetail-nav" aria-label="Event navigation">
                            <button
                                type="button"
                                className="edetail-navbtn"
                                onClick={() => goToIndex(prevIndex)}
                            >
                                <span className="edetail-navdir">
                                    <span aria-hidden="true">←</span> Previous
                                </span>
                                <span className="edetail-navname">{prsm.events[prevIndex].title}</span>
                            </button>
                            <button
                                type="button"
                                className="edetail-navbtn is-next"
                                onClick={() => goToIndex(nextIndex)}
                            >
                                <span className="edetail-navdir">
                                    Next <span aria-hidden="true">→</span>
                                </span>
                                <span className="edetail-navname">{prsm.events[nextIndex].title}</span>
                            </button>
                        </nav>
                    )}

                </div>
            </main>
            <Footer prsm={prsm} />
        </>
    );
}

export default EventDetailPage;
