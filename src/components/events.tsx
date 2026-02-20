import { ORIGIN, Event } from '../constants';
import './events.css';

function Events({ upcomingEvents }: { upcomingEvents: Event[] }) {


    return (
        <section id="events" className="events">
            <div className="events-container">
                <h3>Upcoming Events</h3>
                <p className="events-description">Join fundraisers, awareness walks, and educational webinars.</p>
                <div className="events-grid">
                    {upcomingEvents.map((event, i) => (
                        <div key={event.title} className="event-card" onClick={() => {
                            console.log("Clicked event:", event);
                            window.location.href = ORIGIN + `Events/detail.html?id=${i}`;
                        }}>
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
