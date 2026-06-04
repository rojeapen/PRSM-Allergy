import "./Events.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import Header from "../components/header";

import { Event, ORIGIN, PRSM } from "../constants";
import EventCard from "../components/event_tile";
import Footer from "../components/footer";
import Reveal from "../components/reveal";
import { getPRSM } from "../api/db";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Events />
  </StrictMode>,
);

const DEFAULT_SUBTITLE =
  "Walks, workshops, and research talks that bring the allergy community together. Find one near you and come say hello.";

/** Start of today, for splitting upcoming from past. */
function startOfToday(): number {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}
function eventTime(e: Event): number {
  return new Date(e.date + "T00:00:00").getTime();
}

function Events() {
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

  // Keep each event's original index so detail links stay correct after sorting.
  const today = startOfToday();
  const indexed = prsm.events.map((event, index) => ({ event, index }));
  const upcoming = indexed
    .filter(({ event }) => eventTime(event) >= today)
    .sort((a, b) => eventTime(a.event) - eventTime(b.event));
  const past = indexed
    .filter(({ event }) => eventTime(event) < today)
    .sort((a, b) => eventTime(b.event) - eventTime(a.event));

  const nothingAtAll = prsm.events.length === 0;

  return (
    <>
      <Header isEventPage={true} />
      <main className="events-page">

        {/* ---- Hero ---- */}
        <section className="events-hero section" aria-labelledby="events-hero-title">
          <div className="shell events-hero-shell">
            <Reveal className="events-hero-head">
              <p className="kicker">What&rsquo;s on</p>
              <h1 id="events-hero-title" className="events-hero-title">Events</h1>
              <p className="lede events-hero-lede">
                {prsm.upcomingEventsSubtitle?.trim() || DEFAULT_SUBTITLE}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---- Upcoming ---- */}
        <section className="events-upcoming section" aria-labelledby="events-upcoming-title">
          <div className="shell">
            <Reveal className="events-section-head">
              <h2 id="events-upcoming-title" className="events-section-title">Upcoming</h2>
            </Reveal>

            {upcoming.length > 0 ? (
              <ul className="events-list">
                {upcoming.map(({ event, index }, i) => (
                  <Reveal as="li" key={index} delay={i * 70}>
                    <EventCard event={event} index={index} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="events-empty">
                <p className="events-empty-title">
                  {nothingAtAll
                    ? "No events scheduled yet."
                    : "Nothing on the calendar right now."}
                </p>
                <p className="events-empty-text">
                  We&rsquo;re planning what&rsquo;s next. Check back soon, or
                  follow along to hear when the next one is announced.
                </p>
                <a className="btn-secondary" href={ORIGIN}>
                  Back to home
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ---- Past events (quieter) ---- */}
        {past.length > 0 && (
          <section className="events-past section" aria-labelledby="events-past-title">
            <div className="shell">
              <Reveal className="events-section-head">
                <h2 id="events-past-title" className="events-section-title events-past-title">
                  Past events
                </h2>
              </Reveal>
              <ul className="past-list">
                {past.map(({ event, index }) => (
                  <li key={index}>
                    <a className="past-row" href={`${ORIGIN}Events/detail.html?id=${index}`}>
                      <time className="past-when" dateTime={event.date}>{event.displayDate}</time>
                      <span className="past-title">{event.title}</span>
                      {event.location && <span className="past-where">{event.location}</span>}
                      <span className="past-go" aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

      </main>
      <Footer prsm={prsm} />
    </>
  );
}

export default Events;
