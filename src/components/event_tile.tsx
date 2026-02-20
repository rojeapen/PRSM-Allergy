import  { ORIGIN, Event } from '../constants';
import './event_tile.css';

type EventTileProps = {
    event: Event;
    backgroundColor: string;
    index: number;
}

function EventTile({ event, backgroundColor, index }: EventTileProps) {
    const attendancePercentage = event.attendees && event.capacity ?
        Math.round((event.attendees / event.capacity) * 100) : 0;

    return (
        <section id="event-tile" className={`event-tile ${backgroundColor}`} onClick={() => {
            window.location.href = ORIGIN + `Events/detail.html?id=${index}`;
        }}>
            <div className="event-tile-container">
                <div className="event-image">
                    <img src={event.photoUrl} alt={event.title} />
                </div>

                <div className="event-content">
                    <div className="event-meta">
                        <span className="event-date-badge">
                            <span className="event-icon">📅</span>
                            {event.displayDate}
                        </span>
                        <span className="event-time">
                            <span className="event-icon">🕐</span>
                            {event.getFormattedTime()}
                        </span>
                    </div>


                    <h3>{event.title}</h3>
                    <p className="event-description">
                        {event.description}
                    </p>

                    <div className="event-location">
                        <span className="event-icon">📍</span>
                        {event.location}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EventTile;
