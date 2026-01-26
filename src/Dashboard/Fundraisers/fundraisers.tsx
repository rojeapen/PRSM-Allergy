import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./Fundraisers.css"
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { Fundraiser, PRSM } from '../../constants'
import { getPRSM, updatePRSM, uploadPhoto, deletePhoto } from '../../api/db'
import { Photo } from '../../constants'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

class FundraiserEdit {
    name: string;
    description: string;
    photoUrl?: string;
    photoFile?: File;
    photoId?: string;
    link: string;
    id?: string;
    isFeatured: boolean;

    constructor(params: { name: string; description: string; photoUrl?: string; photoFile?: File; link: string; id?: string, photoId?: string, isFeatured?: boolean }) {
        this.name = params.name;
        this.description = params.description;
        this.photoUrl = params.photoUrl;
        this.photoFile = params.photoFile;
        this.photoId = params.photoId;
        this.link = params.link;
        this.id = params.id;
        this.isFeatured = params.isFeatured ?? false;
    }
}

function App() {
    const [prsm, setPrsm] = useState<PRSM | null>(null)
    const [fundraisers, setFundraisers] = useState<FundraiserEdit[]>([])
    const [canSave, setCanSave] = useState(false)
    const [loadingSave, setLoadingSave] = useState(false)
    const [newFundraiser, setNewFundraiser] = useState<FundraiserEdit>(new FundraiserEdit({ name: '', description: '', link: '' }))
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [editingFundraiser, setEditingFundraiser] = useState<FundraiserEdit | null>(null)

    useEffect(() => {
        isUserLoggedIn((isLoggedIn) => { });
        getPRSM().then((data) => {
            const fundraisersList = data!.fundraisers.map((fundraiser, idx) => {
                console.log("Loaded fundraiser:", fundraiser);
                return new FundraiserEdit({
                    name: fundraiser.name,
                    description: fundraiser.description,
                    photoUrl: fundraiser.photo.url,
                    link: fundraiser.link,
                    photoId: fundraiser.photo.id,
                    id: idx.toString(),
                    isFeatured: fundraiser.isFeatured
                })
            }
            );
            console.log(fundraisersList);
            setFundraisers(fundraisersList);
            setPrsm(data!);

        });
    }, [])

    const handleAddFundraiser = () => {
        if (!newFundraiser.name.trim() || !newFundraiser.description.trim() || !newFundraiser.link.trim()) return;
        setFundraisers([...fundraisers, new FundraiserEdit({ ...newFundraiser })]);
        setNewFundraiser(new FundraiserEdit({ name: '', description: '', link: '' }));
        setCanSave(true);
    };

    const handleEditFundraiser = (idx: number) => {
        setEditingIdx(idx);
        setEditingFundraiser(new FundraiserEdit({ ...fundraisers[idx] }));
    };

    const handleEditFundraiserField = (field: 'name' | 'description' | 'link', value: string) => {
        if (editingFundraiser) {
            setEditingFundraiser(new FundraiserEdit({ ...editingFundraiser, [field]: value }));
        }
    };

    const handleEditFundraiserPhoto = (file: File) => {
        if (editingFundraiser) {
            setEditingFundraiser(new FundraiserEdit({ ...editingFundraiser, photoFile: file }));
        }
    };

    const handleSaveFundraiser = (idx: number) => {
        if (!editingFundraiser) return;
        const updated = [...fundraisers];
        updated[idx] = new FundraiserEdit({ ...editingFundraiser });
        setFundraisers(updated);
        setEditingIdx(null);
        setEditingFundraiser(null);
        setCanSave(true);
    };

    const handleCancelEditFundraiser = () => {
        setEditingIdx(null);
        setEditingFundraiser(null);
    };

    const handleDeleteFundraiser = (idx: number) => {
        setFundraisers(fundraisers.filter((_, i) => i !== idx));
        setCanSave(true);
        if (editingIdx === idx) {
            setEditingIdx(null);
            setEditingFundraiser(null);
        }
    };

    const handleToggleFeatured = (idx: number) => {
        const updated = fundraisers.map((fundraiser, i) => {
            if (i === idx) {
                // Toggle the featured status for this fundraiser
                return new FundraiserEdit({ ...fundraiser, isFeatured: !fundraiser.isFeatured });
            } else if (fundraiser.isFeatured) {
                // Unfeature all other fundraisers
                return new FundraiserEdit({ ...fundraiser, isFeatured: false });
            }
            return fundraiser;
        });
        setFundraisers(updated);
        setCanSave(true);
    };

    const saveFundraisers = async () => {
        if (!prsm) return;
        setLoadingSave(true);

        const uploadedFundraisers: Fundraiser[] = [];
        for (const fundraiser of fundraisers) {

            let photo = new Photo({ url: fundraiser.photoUrl || "", id: fundraiser.photoId || "" });
            console.log("Processing fundraiser:", fundraiser);
            if (fundraiser.photoUrl && fundraiser.photoFile) {
                // If there's an existing photo URL and a new file, delete the old photo
                await deletePhoto(photo);
            }
            if (fundraiser.photoFile) {
                const uploadedPhoto: Photo = await uploadPhoto(fundraiser.photoFile, `Fundraiser ${fundraiser.name}`);
                photo = uploadedPhoto;
            }


            uploadedFundraisers.push(new Fundraiser({
                name: fundraiser.name,
                description: fundraiser.description,
                photo: new Photo({ url: photo.url, id: photo.id }),
                link: fundraiser.link,
                isFeatured: fundraiser.isFeatured,
            }));
        }

        // Delete old fundraisers that are no longer in the list
        for (const oldFundraiser of prsm.fundraisers) {
            const stillExists = uploadedFundraisers.find(f => f.name === oldFundraiser.name);
            if (!stillExists) {
                await deletePhoto(oldFundraiser.photo);
            }
        }

        prsm.fundraisers = uploadedFundraisers;
        await updatePRSM(prsm);
        setCanSave(false);
        setLoadingSave(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    return (
        <>
            <Header isDashboardPage={true} />
            {prsm ? (
                <>
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>Fundraisers</h1>
                            <p>Manage fundraising campaigns shown on the main website.</p>
                        </div>
                        <div className='fundraisers-dashboard-content'>
                            <div className='fundraisers-dashboard-list'>
                                {fundraisers.length === 0 && <div>No fundraisers yet.</div>}
                                {fundraisers.map((fundraiser, idx) => (
                                    <div className='fundraisers-dashboard-item' key={idx}>
                                        {editingIdx === idx ? (
                                            <>
                                                <div className='fundraiser-form-group'>
                                                    <label>Name:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingFundraiser?.name || ''}
                                                        onChange={e => handleEditFundraiserField('name', e.target.value)}
                                                    />
                                                </div>
                                                <div className='fundraiser-form-group'>
                                                    <label>Description:</label>
                                                    <textarea
                                                        className='input-light'
                                                        value={editingFundraiser?.description || ''}
                                                        onChange={e => handleEditFundraiserField('description', e.target.value)}
                                                    />
                                                </div>
                                                <div className='fundraiser-form-group'>
                                                    <label>Donation Link:</label>
                                                    <input
                                                        type='text'
                                                        className='input-light'
                                                        value={editingFundraiser?.link || ''}
                                                        onChange={e => handleEditFundraiserField('link', e.target.value)}
                                                    />
                                                </div>
                                                <div className='fundraiser-form-group'>
                                                    <label>Photo:</label>
                                                    <input
                                                        type='file'
                                                        className='input-light'
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleEditFundraiserPhoto(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    {editingFundraiser?.photoUrl && !editingFundraiser?.photoFile && (
                                                        <img src={editingFundraiser.photoUrl} alt="Preview" className='fundraisers-dashboard-thumbnail' />
                                                    )}
                                                    {editingFundraiser?.photoFile && (
                                                        <img src={URL.createObjectURL(editingFundraiser.photoFile)} alt="Preview" className='fundraisers-dashboard-thumbnail' />
                                                    )}
                                                </div>
                                                <div className='fundraisers-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleSaveFundraiser(idx)}>Save</button>
                                                    <button className='btn-danger' onClick={handleCancelEditFundraiser}>Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='fundraisers-dashboard-item-preview'>
                                                    <img
                                                        src={fundraiser.photoFile != undefined ? URL.createObjectURL(fundraiser.photoFile) : fundraiser.photoUrl ? fundraiser.photoUrl : ''}
                                                        alt={fundraiser.name}
                                                        className='fundraisers-dashboard-thumbnail'
                                                    />
                                                    <div className='fundraisers-dashboard-item-info'>
                                                        <h4>{fundraiser.name}</h4>
                                                        <p>{fundraiser.description}</p>
                                                        <p className='fundraisers-dashboard-item-link'>{fundraiser.link}</p>
                                                    </div>
                                                </div>
                                                <div className='fundraisers-dashboard-actions'>
                                                    <button className={`btn-star ${fundraiser.isFeatured ? 'featured' : ''}`} onClick={() => handleToggleFeatured(idx)} title="Mark as featured">
                                                        {fundraiser.isFeatured ? '★' : '☆'}
                                                    </button>
                                                    <button className='btn-primary' onClick={() => handleEditFundraiser(idx)}>Edit</button>
                                                    <button className='btn-danger' onClick={() => handleDeleteFundraiser(idx)}>Delete</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className='fundraisers-dashboard-add'>
                                <h3 style={{ margin: '0 0 1rem 0' }}>Add New Fundraiser</h3>
                                <div className='fundraiser-form-group'>
                                    <label>Name:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='Fundraiser name'
                                        value={newFundraiser.name}
                                        onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, name: e.target.value }))}
                                    />
                                </div>
                                <div className='fundraiser-form-group'>
                                    <label>Description:</label>
                                    <textarea
                                        className='input-light'
                                        placeholder='Fundraiser description'
                                        value={newFundraiser.description}
                                        onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, description: e.target.value }))}
                                    />
                                </div>
                                <div className='fundraiser-form-group'>
                                    <label>Donation Link:</label>
                                    <input
                                        type='text'
                                        className='input-light'
                                        placeholder='https://...'
                                        value={newFundraiser.link}
                                        onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, link: e.target.value }))}
                                    />
                                </div>
                                <div className='fundraiser-form-group'>
                                    <label>Photo:</label>
                                    <input
                                        type='file'
                                        className='input-light'
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setNewFundraiser(new FundraiserEdit({ ...newFundraiser, photoFile: e.target.files[0] }));
                                            }
                                        }}
                                    />
                                    {newFundraiser.photoFile && (
                                        <img src={URL.createObjectURL(newFundraiser.photoFile)} alt="Preview" className='fundraisers-dashboard-thumbnail' />
                                    )}
                                </div>
                                <button className='btn-primary' onClick={handleAddFundraiser}>Add Fundraiser</button>
                            </div>

                            {canSave && !loadingSave &&
                                <button className='btn-primary' onClick={saveFundraisers}>Save Changes</button>}
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
