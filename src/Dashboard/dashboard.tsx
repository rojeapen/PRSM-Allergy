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
import { AboutTile, Article, Photo, PRSM, SocialMediaLink } from '../constants'
import { deletePhoto, getArticlesFresh, getSubscribers, getPRSMFresh, updatePRSM, uploadPhoto } from '../api/db'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../api/firebase'



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

    // Newsletter state
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticleIdx, setSelectedArticleIdx] = useState<number>(0);
    const [selectedFundraiserIdx, setSelectedFundraiserIdx] = useState<number>(0);
    const [sendingNewsletter, setSendingNewsletter] = useState(false);
    const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
    const [excludedEventIdxs, setExcludedEventIdxs] = useState<Set<number>>(new Set());

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
        getPRSMFresh().then((data) => {
            setPrsm(data!);
            setExcludedEventIdxs(new Set());
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
        getArticlesFresh().then((data) => {
            setArticles(data);
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

    const handleSendNewsletter = async () => {
        if (!prsm || articles.length === 0) return;
        setSendingNewsletter(true);
        setNewsletterStatus(null);
        try {
            const subscribers = await getSubscribers();
            if (subscribers.length === 0) {
                setNewsletterStatus("No subscribers found.");
                setSendingNewsletter(false);
                return;
            }

            const article = articles[selectedArticleIdx];
            const fundraiser = prsm.fundraisers[selectedFundraiserIdx];
            const getExcerpt = (html: string, maxLength: number = 150): string => {
                const div = document.createElement('div');
                div.innerHTML = html;
                const text = div.textContent || div.innerText || '';
                return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
            };

            const payload = {
                emails: subscribers.join(","),
                title: "PRSM Allergy Monthly Newsletter",
                articleTitle: article.title,
                articlePreview: getExcerpt(article.body),
                articleLink: `${window.location.origin}/Articles/detail.html?id=${article.id}`,
                events: prsm.events
                    .filter((_, idx) => !excludedEventIdxs.has(idx))
                    .map(event => ({
                        date: `${event.displayDate} • ${new Date('1970-01-01T' + event.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
                        title: event.title,
                        description: event.description,
                    })),
                fundraiserTitle: fundraiser?.name || "",
                fundraiserDescription: fundraiser?.description || "",
                fundraiserLink: fundraiser?.link || "#",
            };

            const functions = getFunctions(app);
            const sendNewsletter = httpsCallable(functions, 'sendNewsletter');
            await sendNewsletter(payload);
            setNewsletterStatus("Newsletter sent successfully!");
        } catch (error) {
            console.error("Error sending newsletter:", error);
            setNewsletterStatus("Failed to send newsletter. Please try again.");
        }
        setSendingNewsletter(false);
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

                    {/* Send Newsletter Section */}
                    <section className={`dashboard-section white`}>
                        <div className='section-title'>
                            <h1>Send Newsletter</h1>
                            <p>Send a newsletter email to all subscribers with a featured article, upcoming events, and a fundraiser.</p>
                        </div>
                        <div className='socials-dashboard-content'>
                            <div style={{ width: '100%', maxWidth: 600 }}>
                                <div className='section-item' style={{ marginBottom: '1.5rem' }}>
                                    <label htmlFor="newsletter-article" style={{ minWidth: 120 }}>Article:</label>
                                    <select
                                        id="newsletter-article"
                                        className='input-light'
                                        style={{ flex: 1 }}
                                        value={selectedArticleIdx}
                                        onChange={e => setSelectedArticleIdx(Number(e.target.value))}
                                    >
                                        {articles.length === 0 && <option>No articles available</option>}
                                        {articles.map((article, idx) => (
                                            <option key={article.id} value={idx}>{article.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 600 }}>Events ({prsm.events.length - excludedEventIdxs.size}/{prsm.events.length}):</label>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {prsm.events.length === 0 && <p style={{ color: '#888' }}>No events to include.</p>}
                                        {prsm.events.map((event, idx) => {
                                            const excluded = excludedEventIdxs.has(idx);
                                            return (
                                                <div key={idx} style={{
                                                    background: excluded ? '#f0f0f0' : '#f6fbfd',
                                                    borderRadius: 8,
                                                    padding: '0.75rem 1rem',
                                                    borderLeft: `3px solid ${excluded ? '#ccc' : '#008080'}`,
                                                    opacity: excluded ? 0.5 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}>
                                                    <div>
                                                        <strong>{event.title}</strong>
                                                        <br />
                                                        <span style={{ fontSize: '0.85rem', color: '#555' }}>
                                                            {event.displayDate} • {event.time}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setExcludedEventIdxs(prev => {
                                                                const next = new Set(prev);
                                                                if (excluded) next.delete(idx);
                                                                else next.add(idx);
                                                                return next;
                                                            });
                                                        }}
                                                        style={{
                                                            background: excluded ? '#008080' : 'transparent',
                                                            color: excluded ? '#fff' : '#e74c3c',
                                                            border: excluded ? 'none' : '1px solid #e74c3c',
                                                            borderRadius: 6,
                                                            padding: '0.3rem 0.7rem',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            whiteSpace: 'nowrap',
                                                            marginLeft: '0.75rem',
                                                        }}
                                                    >
                                                        {excluded ? 'Include' : 'Remove'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className='section-item' style={{ marginBottom: '1.5rem' }}>
                                    <label htmlFor="newsletter-fundraiser" style={{ minWidth: 120 }}>Fundraiser:</label>
                                    <select
                                        id="newsletter-fundraiser"
                                        className='input-light'
                                        style={{ flex: 1 }}
                                        value={selectedFundraiserIdx}
                                        onChange={e => setSelectedFundraiserIdx(Number(e.target.value))}
                                    >
                                        {prsm.fundraisers.length === 0 && <option>No fundraisers available</option>}
                                        {prsm.fundraisers.map((fundraiser, idx) => (
                                            <option key={idx} value={idx}>{fundraiser.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {!sendingNewsletter && (
                                    <button
                                        className='btn-primary'
                                        onClick={handleSendNewsletter}
                                        disabled={articles.length === 0}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    >
                                        Send Newsletter
                                    </button>
                                )}
                                {sendingNewsletter && <div className='loader'></div>}
                                {newsletterStatus && (
                                    <p style={{
                                        marginTop: '1rem',
                                        textAlign: 'center',
                                        color: newsletterStatus.includes('success') ? '#008080' : '#e74c3c',
                                        fontWeight: 600,
                                    }}>
                                        {newsletterStatus}
                                    </p>
                                )}
                            </div>
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