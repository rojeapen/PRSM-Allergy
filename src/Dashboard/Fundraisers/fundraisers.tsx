import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import "./Fundraisers.css"
import Header from '../../components/header'
import { isUserLoggedIn } from '../../api/auth'
import { DEFAULT_COPY, Fundraiser, PRSM } from '../../constants'
import { getPRSMFresh, updatePRSM, uploadPhoto, deletePhoto } from '../../api/db'
import { Photo } from '../../constants'
import {
    Panel,
    Field,
    EmptyState,
    SaveButton,
    SectionRail,
    DashboardSkeleton,
    useDashboardRail,
    type Section,
} from '../shell'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

const SECTIONS: Section[] = [
    { id: 'subtitle', label: 'Subtitle' },
    { id: 'fundraisers', label: 'Fundraisers' },
    { id: 'pledge', label: 'Pledge banner' },
]

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
    const [loadingSave, setLoadingSave] = useState(false)
    const [newFundraiser, setNewFundraiser] = useState<FundraiserEdit>(new FundraiserEdit({ name: '', description: '', link: '' }))
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [editingFundraiser, setEditingFundraiser] = useState<FundraiserEdit | null>(null)
    const [subtitle, setSubtitle] = useState('')
    const [canSaveSubtitle, setCanSaveSubtitle] = useState(false)
    const [loadingSaveSubtitle, setLoadingSaveSubtitle] = useState(false)
    const [pledgeTitle, setPledgeTitle] = useState('')
    const [pledgeText, setPledgeText] = useState('')
    const [canSavePledge, setCanSavePledge] = useState(false)
    const [loadingSavePledge, setLoadingSavePledge] = useState(false)

    const { activeSection, goToSection } = useDashboardRail(SECTIONS, !!prsm)

    useEffect(() => {
        isUserLoggedIn(() => { });
        getPRSMFresh().then((data) => {
            setSubtitle(data!.fundraisersSubtitle || '');
            setPledgeTitle(data!.fundraiserPledgeTitle || DEFAULT_COPY.fundraiserPledgeTitle);
            setPledgeText(data!.fundraiserPledgeText || DEFAULT_COPY.fundraiserPledgeText);
            const fundraisersList = data!.fundraisers.map((fundraiser, idx) => {
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
            setFundraisers(fundraisersList);
            setPrsm(data!);

        });
    }, [])

    const handleAddFundraiser = async () => {
        if (!newFundraiser.name.trim() || !newFundraiser.description.trim() || !newFundraiser.link.trim()) return;
        const updated = [...fundraisers, new FundraiserEdit({ ...newFundraiser })];
        setFundraisers(updated);
        setNewFundraiser(new FundraiserEdit({ name: '', description: '', link: '' }));
        // Persist immediately so a newly added fundraiser goes live without a separate save step.
        await persistFundraisers(updated);
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

    const handleSaveFundraiser = async (idx: number) => {
        if (!editingFundraiser) return;
        const updated = [...fundraisers];
        updated[idx] = new FundraiserEdit({ ...editingFundraiser });
        setFundraisers(updated);
        setEditingIdx(null);
        setEditingFundraiser(null);
        // Persist the edit immediately.
        await persistFundraisers(updated);
    };

    const handleCancelEditFundraiser = () => {
        setEditingIdx(null);
        setEditingFundraiser(null);
    };

    const handleDeleteFundraiser = async (idx: number) => {
        const updated = fundraisers.filter((_, i) => i !== idx);
        setFundraisers(updated);
        if (editingIdx === idx) {
            setEditingIdx(null);
            setEditingFundraiser(null);
        }
        // Persist immediately so removing a fundraiser takes effect without a separate save step.
        await persistFundraisers(updated);
    };

    const handleToggleFeatured = async (idx: number) => {
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
        await persistFundraisers(updated);
    };

    const handleSubtitleChange = (val: string) => {
        setSubtitle(val);
        setCanSaveSubtitle(true);
    };

    const saveSubtitle = async () => {
        if (!prsm) return;
        setLoadingSaveSubtitle(true);
        prsm.fundraisersSubtitle = subtitle;
        await updatePRSM(prsm);
        setCanSaveSubtitle(false);
        setLoadingSaveSubtitle(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    const handlePledgeTitleChange = (val: string) => {
        setPledgeTitle(val);
        setCanSavePledge(true);
    };

    const handlePledgeTextChange = (val: string) => {
        setPledgeText(val);
        setCanSavePledge(true);
    };

    const savePledge = async () => {
        if (!prsm) return;
        setLoadingSavePledge(true);
        prsm.fundraiserPledgeTitle = pledgeTitle;
        prsm.fundraiserPledgeText = pledgeText;
        await updatePRSM(prsm);
        setCanSavePledge(false);
        setLoadingSavePledge(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    // Uploads any new photos, writes the full fundraisers list to Firebase, and syncs
    // local state so a later edit doesn't re-upload the same file.
    const persistFundraisers = async (list: FundraiserEdit[]) => {
        if (!prsm) return;
        setLoadingSave(true);

        const uploadedFundraisers: Fundraiser[] = [];
        const syncedEdits: FundraiserEdit[] = [];
        for (const fundraiser of list) {
            // Start from the fundraiser's existing photo. Only replace it when a new file
            // was actually chosen, so editing without a new photo keeps the old one.
            let photo = new Photo({ url: fundraiser.photoUrl || "", id: fundraiser.photoId || "" });

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

            syncedEdits.push(new FundraiserEdit({
                name: fundraiser.name,
                description: fundraiser.description,
                photoUrl: photo.url,
                photoId: photo.id,
                link: fundraiser.link,
                id: fundraiser.id,
                isFeatured: fundraiser.isFeatured,
            }));
        }

        // Delete photos that are no longer referenced by any current fundraiser. Matching by
        // photo identity (not name) means a renamed fundraiser who kept their photo, or any
        // fundraiser edited without a new photo, never loses the existing image. This also
        // cleans up the previous photo when one was genuinely replaced.
        const survivingPhotoIds = new Set(uploadedFundraisers.map(f => f.photo.id).filter(Boolean));
        const survivingPhotoUrls = new Set(uploadedFundraisers.map(f => f.photo.url).filter(Boolean));
        for (const oldFundraiser of prsm.fundraisers) {
            const oldPhoto = oldFundraiser.photo;
            if (!oldPhoto || (!oldPhoto.id && !oldPhoto.url)) continue;
            const stillUsed =
                (oldPhoto.id && survivingPhotoIds.has(oldPhoto.id)) ||
                (oldPhoto.url && survivingPhotoUrls.has(oldPhoto.url));
            if (!stillUsed) {
                await deletePhoto(oldPhoto);
            }
        }

        prsm.fundraisers = uploadedFundraisers;
        await updatePRSM(prsm);
        setFundraisers(syncedEdits);
        setLoadingSave(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    return (
        <>
            <Header isDashboardFundraisersPage={true} />
            <main className="dash">
                <div className="dash-head">
                    <p className="kicker">Site content</p>
                    <h1>Fundraisers</h1>
                    <p className="dash-head-sub">
                        Edit the section subtitle and manage the fundraising campaigns shown
                        on the main website. Changes save as you add, edit, or remove them.
                    </p>
                </div>

                {!prsm ? (
                    <DashboardSkeleton sections={SECTIONS} panels={2} />
                ) : (
                    <>
                        <SectionRail
                            sections={SECTIONS}
                            activeSection={activeSection}
                            goToSection={goToSection}
                        />
                        <div className="dash-main">
                            <Panel
                                id="subtitle"
                                title="Page subtitle"
                                desc='Shown under the "Fundraising Initiatives" heading.'
                                action={
                                    <SaveButton
                                        dirty={canSaveSubtitle}
                                        loading={loadingSaveSubtitle}
                                        onClick={saveSubtitle}
                                        label="Save subtitle"
                                    />
                                }
                            >
                                <Field label="Subtitle" htmlFor="fr-subtitle">
                                    <textarea
                                        id="fr-subtitle"
                                        className="field"
                                        rows={3}
                                        value={subtitle}
                                        onChange={e => handleSubtitleChange(e.target.value)}
                                    />
                                </Field>
                            </Panel>

                            <Panel
                                id="fundraisers"
                                title="Fundraisers"
                                desc="Manage fundraising campaigns. The starred campaign is featured on the site. Changes save immediately."
                                action={
                                    loadingSave ? (
                                        <span className="saving-inline">
                                            <span className="spinner-sm is-dark" aria-hidden="true" />
                                            Saving…
                                        </span>
                                    ) : undefined
                                }
                            >
                                <div className="fr-list">
                                    {fundraisers.length === 0 && (
                                        <EmptyState>No fundraisers yet. Add one below.</EmptyState>
                                    )}
                                    {fundraisers.map((fundraiser, idx) => (
                                        editingIdx === idx ? (
                                            <div className="fr-item is-editing" key={idx}>
                                                <div className="fr-edit-fields">
                                                    <Field label="Name" htmlFor={`fr-name-${idx}`}>
                                                        <input
                                                            id={`fr-name-${idx}`}
                                                            type="text"
                                                            className="field"
                                                            value={editingFundraiser?.name || ''}
                                                            onChange={e => handleEditFundraiserField('name', e.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label="Description" htmlFor={`fr-desc-${idx}`}>
                                                        <textarea
                                                            id={`fr-desc-${idx}`}
                                                            className="field"
                                                            rows={3}
                                                            value={editingFundraiser?.description || ''}
                                                            onChange={e => handleEditFundraiserField('description', e.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label="Donation link" htmlFor={`fr-link-${idx}`}>
                                                        <input
                                                            id={`fr-link-${idx}`}
                                                            type="text"
                                                            className="field"
                                                            value={editingFundraiser?.link || ''}
                                                            onChange={e => handleEditFundraiserField('link', e.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label="Photo" hint="replaces the current image">
                                                        <div className="fr-image-field">
                                                            <input
                                                                type="file"
                                                                className="field-file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        handleEditFundraiserPhoto(e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                            {editingFundraiser?.photoFile ? (
                                                                <img src={URL.createObjectURL(editingFundraiser.photoFile)} alt="Preview" className="fr-image-preview" />
                                                            ) : editingFundraiser?.photoUrl ? (
                                                                <img src={editingFundraiser.photoUrl} alt="Preview" className="fr-image-preview" />
                                                            ) : null}
                                                        </div>
                                                    </Field>
                                                </div>
                                                <div className="row-actions">
                                                    <button className="btn-primary" onClick={() => handleSaveFundraiser(idx)}>Save</button>
                                                    <button className="btn-quiet" onClick={handleCancelEditFundraiser}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="fr-item" key={idx}>
                                                <div className="fr-main">
                                                    {(fundraiser.photoFile || fundraiser.photoUrl) && (
                                                        <img
                                                            src={fundraiser.photoFile != undefined ? URL.createObjectURL(fundraiser.photoFile) : fundraiser.photoUrl}
                                                            alt={fundraiser.name}
                                                            className="fr-thumb"
                                                        />
                                                    )}
                                                    <div className="fr-info">
                                                        <h4>{fundraiser.name}</h4>
                                                        <p className="fr-desc">{fundraiser.description}</p>
                                                        <p className="fr-link">{fundraiser.link}</p>
                                                    </div>
                                                </div>
                                                <div className="row-actions">
                                                    <button
                                                        className="fr-star"
                                                        aria-pressed={fundraiser.isFeatured}
                                                        onClick={() => handleToggleFeatured(idx)}
                                                        title={fundraiser.isFeatured ? 'Featured campaign' : 'Mark as featured'}
                                                    >
                                                        {fundraiser.isFeatured ? '★' : '☆'}
                                                    </button>
                                                    <button className="btn-quiet" onClick={() => handleEditFundraiser(idx)}>Edit</button>
                                                    <button className="btn-quiet is-danger" onClick={() => handleDeleteFundraiser(idx)}>Delete</button>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="fr-add">
                                    <h3 className="fr-add-title">Add a fundraiser</h3>
                                    <Field label="Name" htmlFor="fr-new-name">
                                        <input
                                            id="fr-new-name"
                                            type="text"
                                            className="field"
                                            placeholder="Fundraiser name"
                                            value={newFundraiser.name}
                                            onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, name: e.target.value }))}
                                        />
                                    </Field>
                                    <Field label="Description" htmlFor="fr-new-desc">
                                        <textarea
                                            id="fr-new-desc"
                                            className="field"
                                            rows={3}
                                            placeholder="Fundraiser description"
                                            value={newFundraiser.description}
                                            onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, description: e.target.value }))}
                                        />
                                    </Field>
                                    <Field label="Donation link" htmlFor="fr-new-link">
                                        <input
                                            id="fr-new-link"
                                            type="text"
                                            className="field"
                                            placeholder="https://..."
                                            value={newFundraiser.link}
                                            onChange={e => setNewFundraiser(new FundraiserEdit({ ...newFundraiser, link: e.target.value }))}
                                        />
                                    </Field>
                                    <Field label="Photo">
                                        <div className="fr-image-field">
                                            <input
                                                type="file"
                                                className="field-file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setNewFundraiser(new FundraiserEdit({ ...newFundraiser, photoFile: e.target.files[0] }));
                                                    }
                                                }}
                                            />
                                            {newFundraiser.photoFile && (
                                                <img src={URL.createObjectURL(newFundraiser.photoFile)} alt="Preview" className="fr-image-preview" />
                                            )}
                                        </div>
                                    </Field>
                                    <div>
                                        <button className="btn-quiet" onClick={handleAddFundraiser}>Add fundraiser</button>
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                id="pledge"
                                title="Pledge banner"
                                desc='The "Our promise" banner shown at the bottom of the fundraising page.'
                                action={
                                    <SaveButton
                                        dirty={canSavePledge}
                                        loading={loadingSavePledge}
                                        onClick={savePledge}
                                        label="Save banner"
                                    />
                                }
                            >
                                <Field label="Title" htmlFor="fr-pledge-title">
                                    <input
                                        id="fr-pledge-title"
                                        type="text"
                                        className="field"
                                        value={pledgeTitle}
                                        onChange={e => handlePledgeTitleChange(e.target.value)}
                                    />
                                </Field>
                                <Field label="Text" htmlFor="fr-pledge-text">
                                    <textarea
                                        id="fr-pledge-text"
                                        className="field"
                                        rows={3}
                                        value={pledgeText}
                                        onChange={e => handlePledgeTextChange(e.target.value)}
                                    />
                                </Field>
                            </Panel>
                        </div>
                    </>
                )}
            </main>
        </>
    )
}

export default App
