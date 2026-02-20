import { StrictMode, useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./team.css"
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { TeamMember, PRSM } from '../../constants'
import { getPRSMFresh, updatePRSM, uploadPhoto, deletePhoto } from '../../api/db'
import { Photo } from '../../constants'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

class TeamMemberEdit {
    name: string;
    description: string;
    role: string;
    photoUrl?: string;
    photoFile?: File;
    photoId?: string;
    id?: string;

    constructor(params: { name: string; description: string; role: string; photoUrl?: string; photoFile?: File; photoId?: string; id?: string }) {
        this.name = params.name;
        this.description = params.description;
        this.role = params.role;
        this.photoUrl = params.photoUrl;
        this.photoFile = params.photoFile;
        this.photoId = params.photoId;
        this.id = params.id;
    }
}

const CROPPER_SIZE = 220;
const CROP_OUTPUT_SIZE = 400;

function PhotoCropper({ file, onConfirm, onCancel }: { file: File; onConfirm: (croppedFile: File) => void; onCancel: () => void }) {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
    const [imageUrl] = useState(() => URL.createObjectURL(file));

    useEffect(() => {
        const img = new Image();
        img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = imageUrl;
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    if (!naturalSize) return <div className="loader"></div>;

    const baseScale = CROPPER_SIZE / Math.min(naturalSize.w, naturalSize.h);
    const displayW = naturalSize.w * baseScale;
    const displayH = naturalSize.h * baseScale;

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy });
    };

    const handlePointerUp = () => setDragging(false);

    const handleConfirm = () => {
        const totalScale = baseScale * zoom;
        const imgLeft = CROPPER_SIZE / 2 + pan.x - (naturalSize.w * totalScale) / 2;
        const imgTop = CROPPER_SIZE / 2 + pan.y - (naturalSize.h * totalScale) / 2;

        const cropX = Math.max(0, -imgLeft / totalScale);
        const cropY = Math.max(0, -imgTop / totalScale);
        const cropSize = CROPPER_SIZE / totalScale;
        const clampedW = Math.min(cropSize, naturalSize.w - cropX);
        const clampedH = Math.min(cropSize, naturalSize.h - cropY);
        const clampedSize = Math.min(clampedW, clampedH);

        const canvas = document.createElement('canvas');
        canvas.width = CROP_OUTPUT_SIZE;
        canvas.height = CROP_OUTPUT_SIZE;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f6fbfd';
        ctx.fillRect(0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, cropX, cropY, clampedSize, clampedSize, 0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);
            canvas.toBlob((blob) => {
                if (blob) {
                    onConfirm(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
                }
            }, 'image/jpeg', 0.92);
        };
        img.src = imageUrl;
    };

    return (
        <div className="photo-cropper">
            <p className="photo-cropper-hint">Drag to reposition. Use slider to zoom.</p>
            <div
                className="photo-cropper-viewport"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ width: CROPPER_SIZE, height: CROPPER_SIZE }}
            >
                <img
                    src={imageUrl}
                    alt="Crop preview"
                    style={{
                        position: 'absolute',
                        width: `${displayW}px`,
                        height: `${displayH}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                    draggable={false}
                />
            </div>
            <div className="photo-cropper-controls">
                <label>Zoom</label>
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
            </div>
            <div className="photo-cropper-actions">
                <button className="btn-primary" type="button" onClick={handleConfirm}>Confirm Crop</button>
                <button className="btn-danger" type="button" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

function App() {
    const [prsm, setPrsm] = useState<PRSM | null>(null)
    const [teamMembers, setTeamMembers] = useState<TeamMemberEdit[]>([])
    const [canSave, setCanSave] = useState(false)
    const [loadingSave, setLoadingSave] = useState(false)
    const [newMember, setNewMember] = useState<TeamMemberEdit>(new TeamMemberEdit({ name: '', description: '', role: '' }))
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [editingMember, setEditingMember] = useState<TeamMemberEdit | null>(null)
    const [newPhotoRaw, setNewPhotoRaw] = useState<File | null>(null)
    const [editPhotoRaw, setEditPhotoRaw] = useState<File | null>(null)

    useEffect(() => {
        isUserLoggedIn((isLoggedIn) => { });
        getPRSMFresh().then((data) => {
            const membersList = data!.teamMembers.map((member, idx) => {
                return new TeamMemberEdit({
                    name: member.name,
                    description: member.description,
                    role: member.role,
                    photoUrl: member.photo.url,
                    photoId: member.photo.id,
                    id: idx.toString(),
                })
            });
            setTeamMembers(membersList);
            setPrsm(data!);
        });
    }, [])

    const handleAddMember = () => {
        if (!newMember.name.trim() || !newMember.description.trim()) return;
        setTeamMembers([...teamMembers, new TeamMemberEdit({ ...newMember })]);
        setNewMember(new TeamMemberEdit({ name: '', description: '', role: '' }));
        setNewPhotoRaw(null);
        setCanSave(true);
    };

    const handleEditMember = (idx: number) => {
        setEditingIdx(idx);
        setEditingMember(new TeamMemberEdit({ ...teamMembers[idx] }));
    };

    const handleEditMemberField = (field: 'name' | 'description' | 'role', value: string) => {
        if (editingMember) {
            setEditingMember(new TeamMemberEdit({ ...editingMember, [field]: value }));
        }
    };

    const handleEditMemberPhoto = (file: File) => {
        if (editingMember) {
            setEditingMember(new TeamMemberEdit({ ...editingMember, photoFile: file }));
        }
    };

    const handleSaveMember = (idx: number) => {
        if (!editingMember) return;
        const updated = [...teamMembers];
        updated[idx] = new TeamMemberEdit({ ...editingMember });
        setTeamMembers(updated);
        setEditingIdx(null);
        setEditingMember(null);
        setEditPhotoRaw(null);
        setCanSave(true);
    };

    const handleCancelEditMember = () => {
        setEditingIdx(null);
        setEditingMember(null);
        setEditPhotoRaw(null);
    };

    const handleDeleteMember = (idx: number) => {
        setTeamMembers(teamMembers.filter((_, i) => i !== idx));
        setCanSave(true);
        if (editingIdx === idx) {
            setEditingIdx(null);
            setEditingMember(null);
        }
    };

    const saveTeamMembers = async () => {
        if (!prsm) return;
        setLoadingSave(true);

        const uploadedMembers: TeamMember[] = [];
        for (const member of teamMembers) {
            let photo = new Photo({ url: member.photoUrl || "", id: member.photoId || "" });

            if (member.photoUrl && member.photoFile) {
                // If there's an existing photo URL and a new file, delete the old photo
                await deletePhoto(photo);
            }
            if (member.photoFile) {
                const uploadedPhoto: Photo = await uploadPhoto(member.photoFile, `Team Member ${member.name}`);
                photo = uploadedPhoto;
            }

            uploadedMembers.push(new TeamMember({
                name: member.name,
                description: member.description,
                role: member.role,
                photo: new Photo({ url: photo.url, id: photo.id }),
            }));
        }

        // Delete old team members that are no longer in the list
        for (const oldMember of prsm.teamMembers) {
            const stillExists = uploadedMembers.find(m => m.name === oldMember.name);
            if (!stillExists) {
                await deletePhoto(oldMember.photo);
            }
        }

        const updatedPrsm = PRSM.fromMap({ ...prsm.toMap(), teamMembers: uploadedMembers.map(m => m.toMap()) });
        await updatePRSM(updatedPrsm);
        setCanSave(false);
        setLoadingSave(false);
        setPrsm(updatedPrsm);
    };

    return (
        <>
            <Header isDashboardTeamPage={true} />
            {prsm ? (
                <>
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>Team Members</h1>
                            <p>Manage team members shown on the main website.</p>
                        </div>
                        <div className='team-dashboard-content'>
                            <div className='team-dashboard-list'>
                                {teamMembers.length === 0 && <div style={{ textAlign: 'center' }}>No team members yet.</div>}
                                {teamMembers.map((member, idx) => (
                                    <div className='team-dashboard-item' key={idx}>
                                        {editingIdx === idx ? (
                                            <>
                                                <div className='team-form-group'>
                                                    <label>Name:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingMember?.name || ''}
                                                        onChange={e => handleEditMemberField('name', e.target.value)}
                                                    />
                                                </div>
                                                <div className='team-form-group'>
                                                    <label>Role:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingMember?.role || ''}
                                                        onChange={e => handleEditMemberField('role', e.target.value)}
                                                    />
                                                </div>
                                                <div className='team-form-group'>
                                                    <label>Description:</label>
                                                    <textarea
                                                        className='input-light'
                                                        value={editingMember?.description || ''}
                                                        onChange={e => handleEditMemberField('description', e.target.value)}
                                                    />
                                                </div>
                                                <div className='team-form-group'>
                                                    <label>Photo:</label>
                                                    {editPhotoRaw ? (
                                                        <PhotoCropper
                                                            file={editPhotoRaw}
                                                            onConfirm={(cropped) => {
                                                                handleEditMemberPhoto(cropped);
                                                                setEditPhotoRaw(null);
                                                            }}
                                                            onCancel={() => setEditPhotoRaw(null)}
                                                        />
                                                    ) : (
                                                        <>
                                                            <input
                                                                type='file'
                                                                className='input-light'
                                                                accept='image/*'
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        setEditPhotoRaw(e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                            {editingMember?.photoFile && (
                                                                <img src={URL.createObjectURL(editingMember.photoFile)} alt="Preview" className='team-dashboard-thumbnail' />
                                                            )}
                                                            {editingMember?.photoUrl && !editingMember?.photoFile && (
                                                                <img src={editingMember.photoUrl} alt="Preview" className='team-dashboard-thumbnail' />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className='team-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleSaveMember(idx)}>Save</button>
                                                    <button className='btn-danger' onClick={handleCancelEditMember}>Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='team-dashboard-item-preview'>
                                                    <img
                                                        src={member.photoFile != undefined ? URL.createObjectURL(member.photoFile) : member.photoUrl ? member.photoUrl : ''}
                                                        alt={member.name}
                                                        className='team-dashboard-thumbnail'
                                                    />
                                                    <div className='team-dashboard-item-info'>
                                                        <h4>{member.name}</h4>
                                                        {member.role && <p><strong>{member.role}</strong></p>}
                                                        <p>{member.description}</p>
                                                    </div>
                                                </div>
                                                <div className='team-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleEditMember(idx)}>Edit</button>
                                                    <button className='btn-danger' onClick={() => handleDeleteMember(idx)}>Delete</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className='team-dashboard-add'>
                                <h3 style={{ margin: '0 0 1rem 0' }}>Add New Team Member</h3>
                                <div className='team-form-group'>
                                    <label>Name:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='Team member name'
                                        value={newMember.name}
                                        onChange={e => setNewMember(new TeamMemberEdit({ ...newMember, name: e.target.value }))}
                                    />
                                </div>
                                <div className='team-form-group'>
                                    <label>Role:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='e.g. President, Treasurer'
                                        value={newMember.role}
                                        onChange={e => setNewMember(new TeamMemberEdit({ ...newMember, role: e.target.value }))}
                                    />
                                </div>
                                <div className='team-form-group'>
                                    <label>Description:</label>
                                    <textarea
                                        className='input-light'
                                        placeholder='Description'
                                        value={newMember.description}
                                        onChange={e => setNewMember(new TeamMemberEdit({ ...newMember, description: e.target.value }))}
                                    />
                                </div>
                                <div className='team-form-group'>
                                    <label>Photo:</label>
                                    {newPhotoRaw ? (
                                        <PhotoCropper
                                            file={newPhotoRaw}
                                            onConfirm={(cropped) => {
                                                setNewMember(new TeamMemberEdit({ ...newMember, photoFile: cropped }));
                                                setNewPhotoRaw(null);
                                            }}
                                            onCancel={() => setNewPhotoRaw(null)}
                                        />
                                    ) : (
                                        <>
                                            <input
                                                type='file'
                                                className='input-light'
                                                accept='image/*'
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setNewPhotoRaw(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            {newMember.photoFile && (
                                                <img src={URL.createObjectURL(newMember.photoFile)} alt="Preview" className='team-dashboard-thumbnail' />
                                            )}
                                        </>
                                    )}
                                </div>
                                <button className='btn-primary' onClick={handleAddMember}>Add Team Member</button>
                            </div>

                            {canSave && !loadingSave &&
                                <button className='btn-primary' onClick={saveTeamMembers}>Save Changes</button>}
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
