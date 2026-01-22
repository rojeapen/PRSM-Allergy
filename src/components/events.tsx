import { ORIGIN } from '../constants';
import './events.css';

function Events() {
    const eventsList = [
        {
            id: 1,
            date: '2026-04-12',
            displayDate: 'Apr 12, 2026',
            title: 'Annual Awareness Walk',
            location: 'City Park'
        },
        {
            id: 2,
            date: '2026-06-22',
            displayDate: 'Jun 22, 2026',
            title: 'Research Symposium',
            location: '(virtual)'
        }
    ];

    return (
        <section id="events" className="events">
            <div className="events-container">
                <h3>Upcoming Events</h3>
                <p className="events-description">Join fundraisers, awareness walks, and educational webinars.</p>
                <div className="events-grid">
                    {eventsList.map((event) => (
                        <div key={event.id} className="event-card">
                            <time dateTime={event.date} className="event-date">{event.displayDate}</time>
                            <h4 className="event-title">{event.title}</h4>
                            <p className="event-location">{event.location}</p>
                        </div>
                    ))}
                </div>
                <br />
                <button className="btn-secondary all-events" onClick={() => window.location.href = ORIGIN + "Events/"}>View all events</button>
            </div>
        </section>
    );
}

export default Events;
