import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
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
    photoPosX: number;
    photoPosY: number;
    photoZoom: number;

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
        photoPosX?: number;
        photoPosY?: number;
        photoZoom?: number;
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
        this.photoPosX = params.photoPosX ?? 50;
        this.photoPosY = params.photoPosY ?? 50;
        this.photoZoom = params.photoZoom ?? 1;
    }
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function ImageAdjuster({ src, posX, posY, zoom, onChange, onReset }: {
    src: string;
    posX: number;
    posY: number;
    zoom: number;
    onChange: (vals: { posX: number; posY: number; zoom: number }) => void;
    onReset: () => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const liveRef = useRef({ x: posX, y: posY });
    const lastPointerRef = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        draggingRef.current = true;
        liveRef.current = { x: posX, y: posY };
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        // Dragging right should reveal the left side of the image, so position decreases.
        liveRef.current.x = clamp(liveRef.current.x - (dx / rect.width) * 100, 0, 100);
        liveRef.current.y = clamp(liveRef.current.y - (dy / rect.height) * 100, 0, 100);
        onChange({ posX: liveRef.current.x, posY: liveRef.current.y, zoom });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        draggingRef.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const newZoom = clamp(Math.round((zoom + delta) * 100) / 100, 1, 4);
        onChange({ posX, posY, zoom: newZoom });
    };

    return (
        <div className='image-adjuster'>
            <div
                ref={containerRef}
                className='image-adjuster-stage'
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
            >
                <img
                    src={src}
                    alt='Adjust preview'
                    draggable={false}
                    style={{
                        objectPosition: `${posX}% ${posY}%`,
                        transform: `scale(${zoom})`,
                        transformOrigin: `${posX}% ${posY}%`,
                    }}
                />
                <span className='image-adjuster-hint'>Drag to pan • Scroll to zoom</span>
            </div>
            <div className='image-adjuster-controls'>
                <label>
                    <span>Horizontal</span>
                    <input
                        type='range' min={0} max={100} step={1} value={posX}
                        onChange={(e) => onChange({ posX: Number(e.target.value), posY, zoom })}
                    />
                </label>
                <label>
                    <span>Vertical</span>
                    <input
                        type='range' min={0} max={100} step={1} value={posY}
                        onChange={(e) => onChange({ posX, posY: Number(e.target.value), zoom })}
                    />
                </label>
                <label>
                    <span>Zoom</span>
                    <input
                        type='range' min={1} max={4} step={0.05} value={zoom}
                        onChange={(e) => onChange({ posX, posY, zoom: Number(e.target.value) })}
                    />
                </label>
                <button type='button' className='btn-secondary image-adjuster-reset' onClick={onReset}>Reset</button>
            </div>
        </div>
    );
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

    // Stable object URL for the photo being edited so dragging the adjuster doesn't flicker.
    const editingPhotoSrc = useMemo(() => {
        if (!editingEvent) return '';
        if (editingEvent.photoFile) return URL.createObjectURL(editingEvent.photoFile);
        return editingEvent.photoUrl ?? '';
    }, [editingEvent?.photoFile, editingEvent?.photoUrl]);

    useEffect(() => {
        if (editingEvent?.photoFile && editingPhotoSrc.startsWith('blob:')) {
            return () => URL.revokeObjectURL(editingPhotoSrc);
        }
    }, [editingPhotoSrc]);

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
                    photoPosX: event.photoPosX,
                    photoPosY: event.photoPosY,
                    photoZoom: event.photoZoom,
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

    const handleEditEventAdjust = (vals: { posX: number; posY: number; zoom: number }) => {
        if (editingEvent) {
            setEditingEvent(new EventEdit({ ...editingEvent, photoPosX: vals.posX, photoPosY: vals.posY, photoZoom: vals.zoom }));
            setCanSave(true);
        }
    };

    const handleResetEventAdjust = () => {
        if (editingEvent) {
            setEditingEvent(new EventEdit({ ...editingEvent, photoPosX: 50, photoPosY: 50, photoZoom: 1 }));
            setCanSave(true);
        }
    };

    const handleSaveEvent = async (idx: number) => {
        if (!editingEvent) return;
        const updated = [...events];
        updated[idx] = new EventEdit({ ...editingEvent });
        setEvents(updated);
        setEditingIdx(null);
        setEditingEvent(null);
        // Persist straight to Firebase so the change shows on the live event detail page.
        await persistEvents(updated);
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

    // Uploads any new photos, writes the full events list to Firebase, and syncs local state.
    const persistEvents = async (eventsList: EventEdit[]) => {
        if (!prsm) return;
        setLoadingSave(true);

        const uploadedEvents: Event[] = [];
        const syncedEdits: EventEdit[] = [];
        for (const event of eventsList) {
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
                photoPosX: event.photoPosX,
                photoPosY: event.photoPosY,
                photoZoom: event.photoZoom,
            }));

            // Keep local edit state in sync with the uploaded photo so a later save
            // doesn't re-upload the same file.
            syncedEdits.push(new EventEdit({
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                photoUrl: photo.url,
                photoId: photo.id,
                id: event.id,
                photoPosX: event.photoPosX,
                photoPosY: event.photoPosY,
                photoZoom: event.photoZoom,
            }));
        }

        prsm.events = uploadedEvents;
        await updatePRSM(prsm);
        setEvents(syncedEdits);
        setCanSave(false);
        setLoadingSave(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    const saveEvents = async () => {
        // Capture any in-progress edit so unsaved pan/zoom/field changes aren't lost
        // if "Save Changes" is clicked while a row is still being edited.
        const eventsToSave = (editingIdx !== null && editingEvent)
            ? events.map((e, i) => (i === editingIdx ? new EventEdit({ ...editingEvent }) : e))
            : events;
        await persistEvents(eventsToSave);
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
                                                    {(editingEvent?.photoFile || editingEvent?.photoUrl) && (
                                                        <ImageAdjuster
                                                            src={editingPhotoSrc}
                                                            posX={editingEvent.photoPosX}
                                                            posY={editingEvent.photoPosY}
                                                            zoom={editingEvent.photoZoom}
                                                            onChange={handleEditEventAdjust}
                                                            onReset={handleResetEventAdjust}
                                                        />
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
                                                        style={{ objectPosition: `${event.photoPosX}% ${event.photoPosY}%` }}
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
