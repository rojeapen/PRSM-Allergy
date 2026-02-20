import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./events.css"
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { Event, PRSM } from '../../constants'
import { getPRSMFresh, updatePRSM, uploadPhoto, deletePhoto } from '../../api/db'
import { Photo } from '../../constants'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

class EventEdit {
    title: string;
    description: string;
    date: string;

    time: string;
    location: string;
    photoUrl?: string;
    photoFile?: File;
    photoId?: string;
    id?: string;
    capacity?: number;
    attendees?: number;

    constructor(params: {
        title: string;
        description: string;
        date: string;

        time: string;
        location: string;
        photoUrl?: string;
        photoFile?: File;
        photoId?: string;
        id?: string;
        capacity?: number;
        attendees?: number;
    }) {
        this.title = params.title;
        this.description = params.description;
        this.date = params.date;

        this.time = params.time;
        this.location = params.location;
        this.photoUrl = params.photoUrl;
        this.photoFile = params.photoFile;
        this.photoId = params.photoId;
        this.id = params.id;
        this.capacity = params.capacity;
        this.attendees = params.attendees;
    }
}

function App() {
    const [prsm, setPrsm] = useState<PRSM | null>(null)
    const [events, setEvents] = useState<EventEdit[]>([])
    const [canSave, setCanSave] = useState(false)
    const [loadingSave, setLoadingSave] = useState(false)
    const [newEvent, setNewEvent] = useState<EventEdit>(new EventEdit({
        title: '',
        description: '',
        date: '',

        time: '',
        location: '',
    }))
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [editingEvent, setEditingEvent] = useState<EventEdit | null>(null)

    useEffect(() => {
        isUserLoggedIn((isLoggedIn) => { });
        getPRSMFresh().then((data) => {
            const eventsList = data!.events.map((event, idx) => {
                return new EventEdit({
                    title: event.title,
                    description: event.description,
                    date: event.date,

                    time: event.time,
                    location: event.location,
                    photoUrl: event.photoUrl,
                    id: idx.toString(),
                })
            }
            );
            setEvents(eventsList);
            setPrsm(data!);
        });
    }, [])

    const handleAddEvent = () => {
        if (!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.date.trim() || !newEvent.time.trim() || !newEvent.location.trim()) return;
        setEvents([...events, new EventEdit({ ...newEvent })]);
        setNewEvent(new EventEdit({
            title: '',
            description: '',
            date: '',

            time: '',
            location: '',
        }));
        setCanSave(true);
    };

    const handleEditEvent = (idx: number) => {
        setEditingIdx(idx);
        setEditingEvent(new EventEdit({ ...events[idx] }));
    };

    const handleEditEventField = (field: 'title' | 'description' | 'date' | 'time' | 'location', value: string) => {
        if (editingEvent) {
            setEditingEvent(new EventEdit({ ...editingEvent, [field]: value }));
        }
    };

    const handleEditEventPhoto = (file: File) => {
        if (editingEvent) {
            setEditingEvent(new EventEdit({ ...editingEvent, photoFile: file }));
        }
    };

    const handleSaveEvent = (idx: number) => {
        if (!editingEvent) return;
        const updated = [...events];
        updated[idx] = new EventEdit({ ...editingEvent });
        setEvents(updated);
        setEditingIdx(null);
        setEditingEvent(null);
        setCanSave(true);
    };

    const handleCancelEditEvent = () => {
        setEditingIdx(null);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (idx: number) => {
        setEvents(events.filter((_, i) => i !== idx));
        setCanSave(true);
        if (editingIdx === idx) {
            setEditingIdx(null);
            setEditingEvent(null);
        }
    };

    const saveEvents = async () => {
        if (!prsm) return;
        setLoadingSave(true);

        const uploadedEvents: Event[] = [];
        for (const event of events) {
            let photo = new Photo({ url: event.photoUrl || "", id: event.photoId || "" });

            if (event.photoUrl && event.photoFile) {
                // If there's an existing photo URL and a new file, delete the old photo
                await deletePhoto(photo);
            }
            if (event.photoFile) {
                const uploadedPhoto: Photo = await uploadPhoto(event.photoFile, `Event ${event.title}`);
                photo = uploadedPhoto;
            }

            // Format date for display (convert YYYY-MM-DD to readable format)
            const dateObj = new Date(event.date + 'T00:00:00');
            const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            uploadedEvents.push(new Event({
                title: event.title,
                description: event.description,
                date: event.date,
                displayDate: displayDate,
                time: event.time,
                location: event.location,
                photoUrl: photo.url,
            }));
        }

        // Delete old events that are no longer in the list
        for (const oldEvent of prsm.events) {
            const stillExists = uploadedEvents.find(e => e.title === oldEvent.title);
            if (!stillExists) {
                try {
                    const photoRef = oldEvent.photoUrl;
                    if (photoRef) {
                        // Try to clean up if we have a way to delete
                    }
                } catch (error) {
                    console.error("Error deleting event photo:", error);
                }
            }
        }

        prsm.events = uploadedEvents;
        await updatePRSM(prsm);
        setCanSave(false);
        setLoadingSave(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    return (
        <>
            <Header isDashboardEventsPage={true} />
            {prsm ? (
                <>
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>Events</h1>
                            <p>Manage events shown on the main website.</p>
                        </div>
                        <div className='events-dashboard-content'>
                            <div className='events-dashboard-list'>
                                {events.length === 0 && <div>No events yet.</div>}
                                {events.map((event, idx) => (
                                    <div className='events-dashboard-item' key={idx}>
                                        {editingIdx === idx ? (
                                            <>
                                                <div className='event-form-group'>
                                                    <label>Title:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingEvent?.title || ''}
                                                        onChange={e => handleEditEventField('title', e.target.value)}
                                                    />
                                                </div>
                                                <div className='event-form-group'>
                                                    <label>Description:</label>
                                                    <textarea
                                                        className='input-light'
                                                        value={editingEvent?.description || ''}
                                                        onChange={e => handleEditEventField('description', e.target.value)}
                                                    />
                                                </div>
                                                <div className='event-form-group'>
                                                    <label>Date:</label>
                                                    <input
                                                        type='date'
                                                        className='input-light'
                                                        value={editingEvent?.date || ''}
                                                        onChange={e => handleEditEventField('date', e.target.value)}
                                                    />
                                                </div>

                                                <div className='event-form-group'>
                                                    <label>Time:</label>
                                                    <input
                                                        type='time'
                                                        className='input-light'
                                                        value={editingEvent?.time || ''}
                                                        onChange={e => handleEditEventField('time', e.target.value)}
                                                    />
                                                </div>
                                                <div className='event-form-group'>
                                                    <label>Location:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingEvent?.location || ''}
                                                        onChange={e => handleEditEventField('location', e.target.value)}
                                                    />
                                                </div>
                                                <div className='event-form-group'>
                                                    <label>Photo:</label>
                                                    <input
                                                        type='file'
                                                        className='input-light'
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleEditEventPhoto(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    {editingEvent?.photoUrl && !editingEvent?.photoFile && (
                                                        <img src={editingEvent.photoUrl} alt="Preview" className='events-dashboard-thumbnail' />
                                                    )}
                                                    {editingEvent?.photoFile && (
                                                        <img src={URL.createObjectURL(editingEvent.photoFile)} alt="Preview" className='events-dashboard-thumbnail' />
                                                    )}
                                                </div>
                                                <div className='events-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleSaveEvent(idx)}>Save</button>
                                                    <button className='btn-danger' onClick={handleCancelEditEvent}>Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='events-dashboard-item-preview'>
                                                    <img
                                                        src={event.photoFile != undefined ? URL.createObjectURL(event.photoFile) : event.photoUrl ? event.photoUrl : ''}
                                                        alt={event.title}
                                                        className='events-dashboard-thumbnail'
                                                    />
                                                    <div className='events-dashboard-item-info'>
                                                        <h4>{event.title}</h4>
                                                        <p className='event-date-time'>📅 {event.date} • 🕐 {new Event({ title: '', description: '', date: '', displayDate: '', time: event.time, location: '', photoUrl: '' }).getFormattedTime()}</p>
                                                        <p className='event-location'>📍 {event.location}</p>
                                                        <p>{event.description}</p>
                                                    </div>
                                                </div>
                                                <div className='events-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleEditEvent(idx)}>Edit</button>
                                                    <button className='btn-danger' onClick={() => handleDeleteEvent(idx)}>Delete</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className='events-dashboard-add'>
                                <h3 style={{ margin: '0 0 1rem 0' }}>Add New Event</h3>
                                <div className='event-form-group'>
                                    <label>Title:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='Event title'
                                        value={newEvent.title}
                                        onChange={e => setNewEvent(new EventEdit({ ...newEvent, title: e.target.value }))}
                                    />
                                </div>
                                <div className='event-form-group'>
                                    <label>Description:</label>
                                    <textarea
                                        className='input-light'
                                        placeholder='Event description'
                                        value={newEvent.description}
                                        onChange={e => setNewEvent(new EventEdit({ ...newEvent, description: e.target.value }))}
                                    />
                                </div>
                                <div className='event-form-group'>
                                    <label>Date:</label>
                                    <input
                                        type='date'
                                        className='input-light'
                                        value={newEvent.date}
                                        onChange={e => setNewEvent(new EventEdit({ ...newEvent, date: e.target.value }))}
                                    />
                                </div>

                                <div className='event-form-group'>
                                    <label>Time:</label>
                                    <input
                                        type='time'
                                        className='input-light'
                                        value={newEvent.time}
                                        onChange={e => setNewEvent(new EventEdit({ ...newEvent, time: e.target.value }))}
                                    />
                                </div>
                                <div className='event-form-group'>
                                    <label>Location:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='Event location'
                                        value={newEvent.location}
                                        onChange={e => setNewEvent(new EventEdit({ ...newEvent, location: e.target.value }))}
                                    />
                                </div>
                                <div className='event-form-group'>
                                    <label>Photo:</label>
                                    <input
                                        type='file'
                                        className='input-light'
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setNewEvent(new EventEdit({ ...newEvent, photoFile: e.target.files[0] }));
                                            }
                                        }}
                                    />
                                    {newEvent.photoFile && (
                                        <img src={URL.createObjectURL(newEvent.photoFile)} alt="Preview" className='events-dashboard-thumbnail' />
                                    )}
                                </div>
                                <button className='btn-primary' onClick={handleAddEvent}>Add Event</button>
                            </div>

                            {canSave && !loadingSave &&
                                <button className='btn-primary' onClick={saveEvents}>Save Changes</button>}
                            {loadingSave && <div className='loader'></div>}
                        </div>
                    </section>
                </>
            ) : (
                <div className='loader-container'><div className='loader'></div></div>
            )}
        </>
    )
}

export default App
