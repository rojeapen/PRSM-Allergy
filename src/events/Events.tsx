import './Events.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/header';


import { Event } from '../constants';
import EventTile from '../components/event_tile';
import Footer from '../components/footer';


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Events />
    </StrictMode>,
)

function Events() {
    const demoEvents: Event[] = [
        new Event({
            title: "Annual Awareness Walk",
            description: "Join us for our annual awareness walk through the city. This community event brings together supporters, patients, and healthcare professionals to raise awareness and funds for allergy research.",
            date: "2026-04-12",
            displayDate: "Apr 12, 2026",
            time: "09:00 AM",
            location: "City Park",
            photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.lifehugger.com%2Fwp-content%2Fuploads%2F2018%2F06%2FGroup-Walk-1024x681.jpg&f=1&nofb=1&ipt=d8c8e9e2e8c2e8e8e8e8e8e8e8e8e8e8&exif=",
            attendees: 245,
            capacity: 500
        }),
        new Event({
            title: "Research Symposium",
            description: "Learn from leading allergy and immunology researchers as they share the latest breakthroughs in treatment options and preventive strategies. This virtual event is open to healthcare professionals and the general public.",
            date: "2026-06-22",
            displayDate: "Jun 22, 2026",
            time: "01:00 PM",
            location: "Virtual Event",
            photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1552664730-d307ca884978%3Fw%3D1024&f=1&nofb=1&ipt=e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8&exif=",
            attendees: 1200,
            capacity: 2000
        }),
        new Event({
            title: "Community Education Workshop",
            description: "Discover practical tips for managing allergies in daily life. Our experts will cover topics like allergen identification, emergency preparedness, and lifestyle modifications to help you thrive.",
            date: "2026-05-15",
            displayDate: "May 15, 2026",
            time: "06:00 PM",
            location: "Community Center",
            photoUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1552664730-d307ca884978%3Fw%3D1024&f=1&nofb=1&ipt=e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8&exif=",
            attendees: 120,
            capacity: 200
        }),
    ];


    return (
        <>
            <Header isEventPage={true} />
            <main className="events-page">
                <div className='page-hero'>
                    <h1 className="page-title">Upcoming Events</h1>
                    <p className="page-subtitle">Join us at educational workshops, awareness walks, and community events. Get involved and make a difference.</p>
                </div>

                <div className="events-list">
                    {demoEvents.map((event, index) => (
                        <EventTile
                            key={index}
                            event={event}
                            backgroundColor={index % 2 === 0 ? 'light' : 'white'}
                        />
                    ))}
                </div>
            </main>
            <Footer />

        </>
    );
}

export default Events;
