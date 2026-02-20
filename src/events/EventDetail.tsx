import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './event-detail.css'
import Header from '../components/header';
import Footer from '../components/footer';
import { Event, PRSM } from '../constants';
import { getPRSM } from '../api/db';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <EventDetailPage />
    </StrictMode>,
)

function EventDetailPage() {
    const [prsm, setPrsm] = useState<PRSM | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [eventIndex, setEventIndex] = useState<number>(0);

    useEffect(() => {
        getPRSM().then(data => {
            if (data) {
                setPrsm(data);
                // Get event from URL parameter or default to first event
                const params = new URLSearchParams(window.location.search);
                const eventId = params.get('id');
                const index = eventId ? parseInt(eventId) : 0;

                if (data.events && data.events.length > index) {
                    setEvent(data.events[index]);
                    setEventIndex(index);
                }
            }
        });
    }, []);

    const handlePreviousEvent = () => {
        if (prsm && prsm.events.length > 0) {
            const newIndex = eventIndex === 0 ? prsm.events.length - 1 : eventIndex - 1;
            setEvent(prsm.events[newIndex]);
            setEventIndex(newIndex);
            window.history.pushState(null, '', `?id=${newIndex}`);
        }
    };

    const handleNextEvent = () => {
        if (prsm && prsm.events.length > 0) {
            const newIndex = (eventIndex + 1) % prsm.events.length;
            setEvent(prsm.events[newIndex]);
            setEventIndex(newIndex);
            window.history.pushState(null, '', `?id=${newIndex}`);
        }
    };

    return (
        <>
            <Header isDashboardPage={false} />
            <main className="event-detail-main">
                {event ? (
                    <>
                        <section className="event-detail-hero">
                            <img
                                src={event.photoUrl}
                                alt={event.title}
                                className="event-detail-image"
                            />
                            <div className="event-detail-overlay">
                                <div className="event-detail-header-content">
                                    <h1>{event.title}</h1>
                                </div>
                            </div>
                        </section>

                        <section className="event-detail-container">
                            <div className="event-detail-info">


                                <div className="event-detail-description">
                                    <h2>About This Event</h2>
                                    <p>{event.description}</p>
                                </div>


                            </div>

                            <div className="event-detail-sidebar">
                                <div className="event-card-featured">
                                    <h3>Event Details</h3>
                                    <div className="event-card-detail">
                                        <strong>Date:</strong>
                                        <span>{event.displayDate}</span>
                                    </div>
                                    <div className="event-card-detail">
                                        <strong>Time:</strong>
                                        <span>{event.getFormattedTime()}</span>
                                    </div>
                                    <div className="event-card-detail">
                                        <strong>Location:</strong>
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                {prsm && prsm.events.length > 1 && (
                                    <div className="upcoming-events-sidebar">
                                        <h3>Other Upcoming Events</h3>
                                        <div className="sidebar-events-list">
                                            {prsm.events.filter((e) => !(e.title == event.title && e.date == event.date && e.description == event.description)).map((evt, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`sidebar-event ${idx === eventIndex ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setEvent(evt);
                                                        setEventIndex(idx);
                                                        window.history.pushState(null, '', `?id=${idx}`);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <p className="sidebar-event-date">{evt.displayDate}</p>
                                                    <p className="sidebar-event-title">{evt.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="event-detail-loading">
                        <div className="loader"></div>
                        <p>Loading event details...</p>
                    </div>
                )}
            </main>
            {prsm && <Footer prsm={prsm!} />}
        </>
    );
}

export default EventDetailPage;
