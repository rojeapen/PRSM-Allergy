class SocialLinkEdit {
    platform: string;
    url: string;
    id?: string;
    constructor(params: { platform: string; url: string; id?: string }) {
        this.platform = params.platform;
        this.url = params.url;
        this.id = params.id;
    }
}
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'




import "./dashboard.css"
import Header from '../components/header'
import { isUserLoggedIn } from '../api/auth'
import { AboutTile, Photo, PRSM, SocialMediaLink } from '../constants'
import { deletePhoto, getPRSM, updatePRSM, uploadPhoto } from '../api/db'



createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

class GalleryPhoto {
    url?: string;
    file?: File;
    id?: string;

    constructor(params: { url?: string; file?: File, id?: string }) {
        this.url = params.url;
        this.file = params.file;
        this.id = params.id;
    }
}

function App() {

    // Socials state
    const [socialLinks, setSocialLinks] = useState<SocialLinkEdit[]>([]);
    const [canSaveSocials, setCanSaveSocials] = useState(false);
    const [loadingSaveSocials, setLoadingSaveSocials] = useState(false);
    const [newSocial, setNewSocial] = useState<SocialLinkEdit>(new SocialLinkEdit({ platform: '', url: '' }));
    const [editingSocialIdx, setEditingSocialIdx] = useState<number | null>(null);
    const [editingSocial, setEditingSocial] = useState<SocialLinkEdit | null>(null);


    const [prsm, setPrsm] = useState<PRSM | null>(null)
    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("")
    const [backgroundImage, setBackgroundImage] = useState<File | string | null>(null)
    const [canSaveHero, setCanSaveHero] = useState(false)
    const [loadingSaveHero, setLoadingSaveHero] = useState(false)

    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
    const [canSaveGallery, setCanSaveGallery] = useState(false)
    const [loadingSaveGallery, setLoadingSaveGallery] = useState(false)

    // About section state
    const [aboutSubtitle, setAboutSubtitle] = useState("");
    const [aboutTiles, setAboutTiles] = useState<AboutTile[]>([]);
    const [canSaveAboutSubtitle, setCanSaveAboutSubtitle] = useState(false);
    const [loadingSaveAboutSubtitle, setLoadingSaveAboutSubtitle] = useState(false);
    const [newAboutTile, setNewAboutTile] = useState<AboutTile>(new AboutTile({ title: '', description: '' }));
    const [editingAboutTileIdx, setEditingAboutTileIdx] = useState<number | null>(null);
    const [editingAboutTile, setEditingAboutTile] = useState<AboutTile | null>(null);
    const [canSaveAboutTiles, setCanSaveAboutTiles] = useState(false);
    const [loadingSaveAboutTiles, setLoadingSaveAboutTiles] = useState(false);

    useEffect(() => {
        isUserLoggedIn((isLoggedIn) => { });
        getPRSM().then((data) => {
            setPrsm(data!);
            setTitle(data!.landingPageTitle);
            setSubtitle(data!.landingPageSubtitle);
            setBackgroundImage(data!.landingPagePhoto.url);
            const gallery = data!.galleryPhotos.map(photo => new GalleryPhoto({ url: photo.url, id: photo.id }));
            setGalleryPhotos(gallery);
            const socials = data!.socialMediaLinks.map((link, idx) => new SocialLinkEdit({ platform: link.platform, url: link.url, id: idx.toString() }));
            setSocialLinks(socials);
            setAboutSubtitle(data!.aboutSubtitle || "");
            setAboutTiles((data!.aboutTiles || []).map((tile: any) => new AboutTile({ title: tile.title, description: tile.description })));
        });
    }, [])
    // About subtitle handlers
    const handleAboutSubtitleChange = (val: string) => {
        setAboutSubtitle(val);
        setCanSaveAboutSubtitle(true);
    };

    const saveAboutSubtitle = async () => {
        if (!prsm) return;
        setLoadingSaveAboutSubtitle(true);
        prsm.aboutSubtitle = aboutSubtitle;
        await updatePRSM(prsm);
        setCanSaveAboutSubtitle(false);
        setLoadingSaveAboutSubtitle(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };

    // About tiles handlers
    const handleAddAboutTile = () => {
        if (!newAboutTile.title.trim() || !newAboutTile.description.trim()) return;
        setAboutTiles([...aboutTiles, new AboutTile({ title: newAboutTile.title, description: newAboutTile.description })]);
        setNewAboutTile(new AboutTile({ title: '', description: '' }));
        setCanSaveAboutTiles(true);
    };

    const handleEditAboutTile = (idx: number) => {
        setEditingAboutTileIdx(idx);
        setEditingAboutTile(new AboutTile({ ...aboutTiles[idx] }));
    };

    const handleEditAboutTileField = (field: 'title' | 'description', value: string) => {
        if (editingAboutTile) {
            setEditingAboutTile(new AboutTile({ ...editingAboutTile, [field]: value }));
        }
    };

    const handleSaveAboutTile = (idx: number) => {
        if (!editingAboutTile) return;
        const updated = [...aboutTiles];
        updated[idx] = new AboutTile({ ...editingAboutTile });
        setAboutTiles(updated);
        setEditingAboutTileIdx(null);
        setEditingAboutTile(null);
        setCanSaveAboutTiles(true);
    };

    const handleCancelEditAboutTile = () => {
        setEditingAboutTileIdx(null);
        setEditingAboutTile(null);
    };

    const handleDeleteAboutTile = (idx: number) => {
        setAboutTiles(aboutTiles.filter((_, i) => i !== idx));
        setCanSaveAboutTiles(true);
        if (editingAboutTileIdx === idx) {
            setEditingAboutTileIdx(null);
            setEditingAboutTile(null);
        }
    };

    const saveAboutTiles = async () => {
        if (!prsm) return;
        setLoadingSaveAboutTiles(true);
        prsm.aboutTiles = aboutTiles;
        await updatePRSM(prsm);
        setCanSaveAboutTiles(false);
        setLoadingSaveAboutTiles(false);
        setPrsm(PRSM.fromMap(prsm.toMap()));
    };



    const saveHeroSection = async () => {
        setLoadingSaveHero(true);
        prsm!.landingPageTitle = title;
        prsm!.landingPageSubtitle = subtitle;

        if (backgroundImage && typeof backgroundImage !== 'string') {
            //delete old photo from storage
            await deletePhoto(prsm!.landingPagePhoto);
            const uploadedPhoto: Photo = await uploadPhoto(backgroundImage, "Landing Page Background");
            prsm!.landingPagePhoto = uploadedPhoto;
        }
        await updatePRSM(prsm!);
        setCanSaveHero(false);
        setLoadingSaveHero(false);
        setPrsm(PRSM.fromMap(prsm!.toMap())); // Refresh state
    }

    const handleAddGalleryPhoto = async (image: File) => {
        setGalleryPhotos([...galleryPhotos, new GalleryPhoto({ file: image })]);
        setCanSaveGallery(true);
    }

    const handleDeleteGalleryPhoto = (imageSrc: string | File | undefined) => {
        const updatedPhotos = galleryPhotos.filter(photo => {
            if (photo.file) {
                return photo.file !== imageSrc;
            } else {
                return photo.url !== imageSrc;
            }
        });
        setGalleryPhotos(updatedPhotos);
        setCanSaveGallery(true);
    }

    const saveGallerySection = async () => {
        setLoadingSaveGallery(true);
        const uploadedPhotos: Photo[] = [];
        for (const photo of galleryPhotos) {
            if (photo.file) {
                const uploadedPhoto: Photo = await uploadPhoto(photo.file, `Gallery Photo ${Date.now()}`);
                uploadedPhotos.push(uploadedPhoto);
            } else if (photo.url) {
                uploadedPhotos.push(new Photo({ url: photo.url, id: photo.id! })); // Retain existing photos
            }
        }
        //delete old photos from storage that are not in the new gallery
        for (const oldPhoto of prsm!.galleryPhotos) {
            const stillExists = uploadedPhotos.find(photo => photo.id === oldPhoto.id);
            if (!stillExists) {
                //delete from storage
                await deletePhoto(oldPhoto);
            }
        }
        prsm!.galleryPhotos = uploadedPhotos;
        await updatePRSM(prsm!);
        setCanSaveGallery(false);
        setLoadingSaveGallery(false);
        setPrsm(PRSM.fromMap(prsm!.toMap())); // Refresh state
    }

    // Socials handlers
    const handleAddSocial = () => {
        if (!newSocial.platform.trim() || !newSocial.url.trim()) return;
        setSocialLinks([...socialLinks, new SocialLinkEdit({ platform: newSocial.platform, url: newSocial.url })]);
        setNewSocial(new SocialLinkEdit({ platform: '', url: '' }));
        setCanSaveSocials(true);
    };


    const handleEditSocial = (idx: number) => {
        setEditingSocialIdx(idx);
        setEditingSocial(new SocialLinkEdit({ ...socialLinks[idx] }));
    };

    const handleEditSocialField = (field: 'platform' | 'url', value: string) => {
        if (editingSocial) {
            setEditingSocial(new SocialLinkEdit({ ...editingSocial, [field]: value }));
        }
    };

    const handleSaveSocial = (idx: number) => {
        if (!editingSocial) return;
        const updated = [...socialLinks];
        updated[idx] = new SocialLinkEdit({ ...editingSocial });
        setSocialLinks(updated);
        setEditingSocialIdx(null);
        setEditingSocial(null);
        setCanSaveSocials(true);
    };

    const handleCancelEditSocial = () => {
        setEditingSocialIdx(null);
        setEditingSocial(null);
    };

    const handleDeleteSocial = (idx: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== idx));
        setCanSaveSocials(true);
        if (editingSocialIdx === idx) {
            setEditingSocialIdx(null);
            setEditingSocial(null);
        }
    };

    const saveSocialsSection = async () => {
        setLoadingSaveSocials(true);
        prsm!.socialMediaLinks = socialLinks.map(link => (new SocialMediaLink({ platform: link.platform, url: link.url })));
        await updatePRSM(prsm!);
        setCanSaveSocials(false);
        setLoadingSaveSocials(false);
        setPrsm(PRSM.fromMap(prsm!.toMap()));
    };

    return (
        <>
            <Header isDashboardPage={true} />
            {prsm ? (
                <>
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>Hero Section</h1>
                            <p>Edit the hero section of the main website</p>
                        </div>
                        <div className='section-content-horizontal'>
                            <div className='hero-inputs-side'>
                                <div className='section-item'>
                                    <label htmlFor="title" >Title: </label>
                                    <input type="text" id="title" className='input-light' value={title} onChange={(e) => {
                                        setTitle(e.target.value);
                                        setCanSaveHero(true);
                                    }} />
                                </div>
                                <div className='section-item'>
                                    <label htmlFor="subtitle" >Subtitle: </label>
                                    <input type="text" id="subtitle" className='input-light' value={subtitle} onChange={(e) => {
                                        setSubtitle(e.target.value);
                                        setCanSaveHero(true);
                                    }} />
                                </div>
                                <div className='section-item'>
                                    <label htmlFor="background-image" >Background Image: </label>
                                    <input type="file" id="background-image" className='input-light' onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setBackgroundImage(e.target.files[0]);
                                            setCanSaveHero(true);
                                        }
                                    }} />
                                </div>
                                {canSaveHero && !loadingSaveHero &&
                                    <button className='btn-primary' onClick={saveHeroSection}>Save Changes</button>}
                                {loadingSaveHero && <div className='loader'></div>}
                            </div>
                            <div className='hero-preview-side'>
                                <label>Preview Image</label>
                                <div className='hero-preview'>
                                    {backgroundImage ?
                                        (typeof backgroundImage === 'string' ?
                                            <img src={backgroundImage} alt="Background Preview" className='hero-preview-image' /> :
                                            <img src={URL.createObjectURL(backgroundImage)} alt="Background Preview" className='hero-preview-image' />)
                                        : <div className='no-image'>No Image Selected</div>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Gallery Management Section */}
                    <section className={`dashboard-section white`}>
                        <div className='section-title'>
                            <h1>Gallery Photos</h1>
                            <p>View, add, or delete gallery photos shown on the main website.</p>
                        </div>
                        <div className='gallery-dashboard-content'>

                            <div className='gallery-dashboard-list'>
                                {galleryPhotos.length === 0 && <div>No gallery photos yet.</div>}
                                {galleryPhotos.map(photo => (
                                    <div className='gallery-dashboard-photo'>
                                        <img src={photo.url ?? URL.createObjectURL(photo.file!)} alt="Gallery" className='gallery-dashboard-img' />
                                        <button className='btn-danger' onClick={() => handleDeleteGalleryPhoto(photo.file ?? photo.url)}>Delete</button>
                                    </div>
                                ))}
                            </div>

                            <div className='gallery-dashboard-upload'>
                                <label htmlFor="gallery-upload">Add Photo:</label>
                                <input type="file" id="gallery-upload" className='input-light' onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleAddGalleryPhoto(e.target.files[0]);
                                    }
                                }} />

                            </div>
                            {canSaveGallery && !loadingSaveGallery &&
                                <button className='btn-primary' onClick={saveGallerySection}>Save Changes</button>}
                            {loadingSaveGallery && <div className='loader'></div>}

                        </div>
                    </section>

                    {/* About Section Management */}
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>About Section</h1>
                            <p>Edit the about subtitle and about tiles shown on the main website.</p>
                        </div>
                        <div className='section-content'>
                            <div className='section-item' style={{ width: '100%', maxWidth: 600 }}>
                                <label htmlFor="about-subtitle" style={{ minWidth: 100 }}>Subtitle:</label>
                                <input
                                    type="text"
                                    id="about-subtitle"
                                    className='input-light'
                                    value={aboutSubtitle}
                                    onChange={e => handleAboutSubtitleChange(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                {canSaveAboutSubtitle && !loadingSaveAboutSubtitle && (
                                    <button className='btn-primary' onClick={saveAboutSubtitle}>Save</button>
                                )}
                                {loadingSaveAboutSubtitle && <div className='loader'></div>}
                            </div>
                            <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
                                <h3 style={{ margin: '1rem 0 0.5rem 0' }}>About Tiles</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {aboutTiles.length === 0 && <div>No about tiles yet.</div>}
                                    {aboutTiles.map((tile, idx) => (
                                        <div className='socials-dashboard-item' key={idx} style={{ alignItems: 'flex-start' }}>
                                            {editingAboutTileIdx === idx ? (
                                                <>
                                                    <div className='socials-dashboard-info' style={{ flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input
                                                            className='input-light socials-input'
                                                            type='text'
                                                            value={editingAboutTile?.title || ''}
                                                            placeholder='Title'
                                                            onChange={e => handleEditAboutTileField('title', e.target.value)}
                                                        />
                                                        <input
                                                            className='input-light socials-input'
                                                            type='text'
                                                            value={editingAboutTile?.description || ''}
                                                            placeholder='Description'
                                                            onChange={e => handleEditAboutTileField('description', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='socials-dashboard-actions'>
                                                        <button className='btn-primary' onClick={() => handleSaveAboutTile(idx)}>Save</button>
                                                        <button className='btn-danger' onClick={handleCancelEditAboutTile}>Cancel</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className='socials-dashboard-info' style={{ flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label htmlFor="">{tile.title}</label>
                                                        <label htmlFor="">{tile.description}</label>
                                                    </div>
                                                    <div className='socials-dashboard-actions'>
                                                        <button className='btn-primary' onClick={() => handleEditAboutTile(idx)}>Edit</button>
                                                        <button className='btn-danger' onClick={() => handleDeleteAboutTile(idx)}>Delete</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className='socials-dashboard-add' style={{ marginTop: '1rem' }}>
                                    <input
                                        className='input-light socials-input'
                                        type='text'
                                        value={newAboutTile.title}
                                        placeholder='Title'
                                        onChange={e => setNewAboutTile(new AboutTile({ ...newAboutTile, title: e.target.value }))}
                                    />
                                    <input
                                        className='input-light socials-input'
                                        type='text'
                                        value={newAboutTile.description}
                                        placeholder='Description'
                                        onChange={e => setNewAboutTile(new AboutTile({ ...newAboutTile, description: e.target.value }))}
                                    />
                                    <button className='btn-primary' onClick={handleAddAboutTile}>Add</button>
                                </div>
                                {canSaveAboutTiles && !loadingSaveAboutTiles && (
                                    <button className='btn-primary' style={{ marginTop: '1rem' }} onClick={saveAboutTiles}>Save Changes</button>
                                )}
                                {loadingSaveAboutTiles && <div className='loader'></div>}
                            </div>
                        </div>
                    </section>

                    {/* Social Media Links Management Section */}
                    <section className={`dashboard-section light`}>
                        <div className='section-title'>
                            <h1>Social Media Links</h1>
                            <p>View, add, edit, or delete social media links shown on the main website.</p>
                        </div>
                        <div className='socials-dashboard-content'>
                            <div className='socials-dashboard-list'>
                                {socialLinks.length === 0 && <div>No social media links yet.</div>}
                                {socialLinks.map((link, idx) => (
                                    <div className='socials-dashboard-item' key={idx}>
                                        {editingSocialIdx === idx ? (
                                            <>
                                                <input
                                                    className='input-light socials-input'
                                                    type='text'
                                                    value={editingSocial?.platform || ''}
                                                    placeholder='Platform'
                                                    onChange={e => handleEditSocialField('platform', e.target.value)}
                                                />
                                                <input
                                                    className='input-light socials-input'
                                                    type='text'
                                                    value={editingSocial?.url || ''}
                                                    placeholder='URL'
                                                    onChange={e => handleEditSocialField('url', e.target.value)}
                                                />


                                                <button className='btn-primary' onClick={() => handleSaveSocial(idx)}>Save</button>
                                                <button className='btn-danger' onClick={handleCancelEditSocial}>Cancel</button>

                                            </>
                                        ) : (
                                            <>
                                                <div className='socials-dashboard-info'>
                                                    <label htmlFor="">{link.platform}</label>
                                                    <label htmlFor="">{link.url}</label>
                                                </div>
                                                <div className='socials-dashboard-actions'>
                                                    <button className='btn-primary' onClick={() => handleEditSocial(idx)}>Edit</button>
                                                    <button className='btn-danger' onClick={() => handleDeleteSocial(idx)}>Delete</button>
                                                </div>

                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className='socials-dashboard-add'>
                                <input
                                    className='input-light socials-input'
                                    type='text'
                                    value={newSocial.platform}
                                    placeholder='Platform'
                                    onChange={e => setNewSocial(new SocialLinkEdit({ ...newSocial, platform: e.target.value }))}
                                />
                                <input
                                    className='input-light socials-input'
                                    type='text'
                                    value={newSocial.url}
                                    placeholder='URL'
                                    onChange={e => setNewSocial(new SocialLinkEdit({ ...newSocial, url: e.target.value }))}
                                />
                                <button className='btn-primary' onClick={handleAddSocial}>Add</button>
                            </div>
                            {canSaveSocials && !loadingSaveSocials &&
                                <button className='btn-primary' onClick={saveSocialsSection}>Save Changes</button>}
                            {loadingSaveSocials && <div className='loader'></div>}
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