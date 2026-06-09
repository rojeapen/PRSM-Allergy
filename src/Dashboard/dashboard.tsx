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
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";

import "./dashboard.css";
import {
  Panel,
  Field,
  EmptyState,
  SaveButton,
  SectionRail,
  DashboardSkeleton,
  useDashboardRail,
  type Section,
} from "./shell";
import Header from "../components/header";
import { isUserLoggedIn } from "../api/auth";
import {
  AboutTile,
  Article,
  DEFAULT_COPY,
  Photo,
  PRSM,
  SocialMediaLink,
} from "../constants";
import {
  deletePhoto,
  getArticlesFresh,
  getSubscribers,
  getSubscribersDetailed,
  getPRSMFresh,
  updatePRSM,
  uploadPhoto,
  type Subscriber,
} from "../api/db";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../api/firebase";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

let galleryUidSeq = 0;

class GalleryPhoto {
  url?: string;
  file?: File;
  id?: string;
  // Stable client-side key so reordered tiles keep their identity in React
  // (file-backed photos have no Firebase id until they're saved).
  uid: string;

  constructor(params: { url?: string; file?: File; id?: string }) {
    this.url = params.url;
    this.file = params.file;
    this.id = params.id;
    this.uid = `gp-${galleryUidSeq++}`;
  }
}

/* The six editable content areas, in scroll order. Drives the rail. */
const SECTIONS: Section[] = [
  { id: "hero", label: "Hero" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "fundraiser", label: "Featured fundraiser" },
  { id: "events-intro", label: "Events" },
  { id: "newsletter-copy", label: "Newsletter" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
  { id: "socials", label: "Social links" },
  { id: "subscribers", label: "Subscribers" },
  { id: "newsletter", label: "Send newsletter" },
];

function App() {
  // Socials state
  const [socialLinks, setSocialLinks] = useState<SocialLinkEdit[]>([]);
  const [canSaveSocials, setCanSaveSocials] = useState(false);
  const [loadingSaveSocials, setLoadingSaveSocials] = useState(false);
  const [newSocial, setNewSocial] = useState<SocialLinkEdit>(
    new SocialLinkEdit({ platform: "", url: "" }),
  );
  const [editingSocialIdx, setEditingSocialIdx] = useState<number | null>(null);
  const [editingSocial, setEditingSocial] = useState<SocialLinkEdit | null>(
    null,
  );

  const [prsm, setPrsm] = useState<PRSM | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<File | string | null>(
    null,
  );
  const [canSaveHero, setCanSaveHero] = useState(false);
  const [loadingSaveHero, setLoadingSaveHero] = useState(false);

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [canSaveGallery, setCanSaveGallery] = useState(false);
  const [loadingSaveGallery, setLoadingSaveGallery] = useState(false);

  // Landing-page section copy (kickers / titles / subtitles).
  const [heroKicker, setHeroKicker] = useState("");
  const [heroNote, setHeroNote] = useState("");

  const [galleryKicker, setGalleryKicker] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [gallerySubtitle, setGallerySubtitle] = useState("");
  const [canSaveGalleryCopy, setCanSaveGalleryCopy] = useState(false);
  const [loadingSaveGalleryCopy, setLoadingSaveGalleryCopy] = useState(false);

  const [aboutKicker, setAboutKicker] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");

  const [eventsKicker, setEventsKicker] = useState("");
  const [eventsTitle, setEventsTitle] = useState("");

  const [fundraiserKicker, setFundraiserKicker] = useState("");
  const [canSaveFundraiserCopy, setCanSaveFundraiserCopy] = useState(false);
  const [loadingSaveFundraiserCopy, setLoadingSaveFundraiserCopy] =
    useState(false);

  const [newsletterKicker, setNewsletterKicker] = useState("");
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterSubtitle, setNewsletterSubtitle] = useState("");
  const [canSaveNewsletterCopy, setCanSaveNewsletterCopy] = useState(false);
  const [loadingSaveNewsletterCopy, setLoadingSaveNewsletterCopy] =
    useState(false);

  const [contactKicker, setContactKicker] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactSubtitle, setContactSubtitle] = useState("");
  const [canSaveContactCopy, setCanSaveContactCopy] = useState(false);
  const [loadingSaveContactCopy, setLoadingSaveContactCopy] = useState(false);

  const [footerMission, setFooterMission] = useState("");
  const [footerFine, setFooterFine] = useState("");
  const [canSaveFooterCopy, setCanSaveFooterCopy] = useState(false);
  const [loadingSaveFooterCopy, setLoadingSaveFooterCopy] = useState(false);

  // Newsletter state
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleIdx, setSelectedArticleIdx] = useState<number>(0);
  const [selectedFundraiserIdx, setSelectedFundraiserIdx] = useState<number>(0);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [excludedEventIdxs, setExcludedEventIdxs] = useState<Set<number>>(
    new Set(),
  );

  // Subscribers list (null = still loading)
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // About section state
  const [aboutSubtitle, setAboutSubtitle] = useState("");
  const [upcomingEventsSubtitle, setUpcomingEventsSubtitle] = useState("");
  const [aboutTiles, setAboutTiles] = useState<AboutTile[]>([]);
  const [canSaveAboutSubtitle, setCanSaveAboutSubtitle] = useState(false);
  const [loadingSaveAboutSubtitle, setLoadingSaveAboutSubtitle] =
    useState(false);
  const [canSaveUpcomingEventsSubtitle, setCanSaveUpcomingEventsSubtitle] =
    useState(false);
  const [
    loadingSaveUpcomingEventsSubtitle,
    setLoadingSaveUpcomingEventsSubtitle,
  ] = useState(false);
  const [newAboutTile, setNewAboutTile] = useState<AboutTile>(
    new AboutTile({ title: "", description: "" }),
  );
  const [editingAboutTileIdx, setEditingAboutTileIdx] = useState<number | null>(
    null,
  );
  const [editingAboutTile, setEditingAboutTile] = useState<AboutTile | null>(
    null,
  );
  const [canSaveAboutTiles, setCanSaveAboutTiles] = useState(false);
  const [loadingSaveAboutTiles, setLoadingSaveAboutTiles] = useState(false);

  // Section rail / scrollspy
  const { activeSection, goToSection } = useDashboardRail(SECTIONS, !!prsm);

  useEffect(() => {
    isUserLoggedIn((isLoggedIn) => {});
    getPRSMFresh().then((data) => {
      setPrsm(data!);
      setExcludedEventIdxs(new Set());
      setTitle(data!.landingPageTitle);
      setSubtitle(data!.landingPageSubtitle);
      setBackgroundImage(data!.landingPagePhoto.url);
      const gallery = data!.galleryPhotos.map(
        (photo) => new GalleryPhoto({ url: photo.url, id: photo.id }),
      );
      setGalleryPhotos(gallery);
      const socials = data!.socialMediaLinks.map(
        (link, idx) =>
          new SocialLinkEdit({
            platform: link.platform,
            url: link.url,
            id: idx.toString(),
          }),
      );
      setSocialLinks(socials);
      setAboutSubtitle(data!.aboutSubtitle || "");
      setUpcomingEventsSubtitle(
        data!.upcomingEventsSubtitle || DEFAULT_COPY.eventsSubtitle,
      );
      // Initialize each copy field with its effective value: the saved text, or
      // the live default when the document predates these fields.
      setHeroKicker(data!.heroKicker || DEFAULT_COPY.heroKicker);
      setHeroNote(data!.heroNote || DEFAULT_COPY.heroNote);
      setGalleryKicker(data!.galleryKicker || DEFAULT_COPY.galleryKicker);
      setGalleryTitle(data!.galleryTitle || DEFAULT_COPY.galleryTitle);
      setGallerySubtitle(data!.gallerySubtitle || DEFAULT_COPY.gallerySubtitle);
      setAboutKicker(data!.aboutKicker || DEFAULT_COPY.aboutKicker);
      setAboutTitle(data!.aboutTitle || DEFAULT_COPY.aboutTitle);
      setEventsKicker(data!.eventsKicker || DEFAULT_COPY.eventsKicker);
      setEventsTitle(data!.eventsTitle || DEFAULT_COPY.eventsTitle);
      setFundraiserKicker(
        data!.fundraiserKicker || DEFAULT_COPY.fundraiserKicker,
      );
      setNewsletterKicker(
        data!.newsletterKicker || DEFAULT_COPY.newsletterKicker,
      );
      setNewsletterTitle(data!.newsletterTitle || DEFAULT_COPY.newsletterTitle);
      setNewsletterSubtitle(
        data!.newsletterSubtitle || DEFAULT_COPY.newsletterSubtitle,
      );
      setContactKicker(data!.contactKicker || DEFAULT_COPY.contactKicker);
      setContactTitle(data!.contactTitle || DEFAULT_COPY.contactTitle);
      setContactSubtitle(
        data!.contactSubtitle || DEFAULT_COPY.contactSubtitle,
      );
      setFooterMission(data!.footerMission || DEFAULT_COPY.footerMission);
      setFooterFine(data!.footerFine || DEFAULT_COPY.footerFine);
      setAboutTiles(
        (data!.aboutTiles || []).map(
          (tile: any) =>
            new AboutTile({ title: tile.title, description: tile.description }),
        ),
      );
    });
    getArticlesFresh().then((data) => {
      setArticles(data);
    });
    getSubscribersDetailed()
      .then(setSubscribers)
      .catch(() => setSubscribers([]));
  }, []);

  // About subtitle handlers
  const handleAboutSubtitleChange = (val: string) => {
    setAboutSubtitle(val);
    setCanSaveAboutSubtitle(true);
  };

  const handleUpcomingEventsSubtitleChange = (val: string) => {
    setUpcomingEventsSubtitle(val);
    setCanSaveUpcomingEventsSubtitle(true);
  };

  const saveAboutSubtitle = async () => {
    if (!prsm) return;
    setLoadingSaveAboutSubtitle(true);
    prsm.aboutKicker = aboutKicker;
    prsm.aboutTitle = aboutTitle;
    prsm.aboutSubtitle = aboutSubtitle;
    await updatePRSM(prsm);
    setCanSaveAboutSubtitle(false);
    setLoadingSaveAboutSubtitle(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  const saveUpcomingEventsSubtitle = async () => {
    if (!prsm) return;
    setLoadingSaveUpcomingEventsSubtitle(true);
    prsm.eventsKicker = eventsKicker;
    prsm.eventsTitle = eventsTitle;
    prsm.upcomingEventsSubtitle = upcomingEventsSubtitle;
    await updatePRSM(prsm);
    setCanSaveUpcomingEventsSubtitle(false);
    setLoadingSaveUpcomingEventsSubtitle(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  // Gallery / fundraiser / newsletter / contact section copy.
  const saveGalleryCopy = async () => {
    if (!prsm) return;
    setLoadingSaveGalleryCopy(true);
    prsm.galleryKicker = galleryKicker;
    prsm.galleryTitle = galleryTitle;
    prsm.gallerySubtitle = gallerySubtitle;
    await updatePRSM(prsm);
    setCanSaveGalleryCopy(false);
    setLoadingSaveGalleryCopy(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  const saveFundraiserCopy = async () => {
    if (!prsm) return;
    setLoadingSaveFundraiserCopy(true);
    prsm.fundraiserKicker = fundraiserKicker;
    await updatePRSM(prsm);
    setCanSaveFundraiserCopy(false);
    setLoadingSaveFundraiserCopy(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  const saveNewsletterCopy = async () => {
    if (!prsm) return;
    setLoadingSaveNewsletterCopy(true);
    prsm.newsletterKicker = newsletterKicker;
    prsm.newsletterTitle = newsletterTitle;
    prsm.newsletterSubtitle = newsletterSubtitle;
    await updatePRSM(prsm);
    setCanSaveNewsletterCopy(false);
    setLoadingSaveNewsletterCopy(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  const saveContactCopy = async () => {
    if (!prsm) return;
    setLoadingSaveContactCopy(true);
    prsm.contactKicker = contactKicker;
    prsm.contactTitle = contactTitle;
    prsm.contactSubtitle = contactSubtitle;
    await updatePRSM(prsm);
    setCanSaveContactCopy(false);
    setLoadingSaveContactCopy(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  const saveFooterCopy = async () => {
    if (!prsm) return;
    setLoadingSaveFooterCopy(true);
    prsm.footerMission = footerMission;
    prsm.footerFine = footerFine;
    await updatePRSM(prsm);
    setCanSaveFooterCopy(false);
    setLoadingSaveFooterCopy(false);
    setPrsm(PRSM.fromMap(prsm.toMap()));
  };

  // About tiles handlers
  const handleAddAboutTile = () => {
    if (!newAboutTile.title.trim() || !newAboutTile.description.trim()) return;
    setAboutTiles([
      ...aboutTiles,
      new AboutTile({
        title: newAboutTile.title,
        description: newAboutTile.description,
      }),
    ]);
    setNewAboutTile(new AboutTile({ title: "", description: "" }));
    setCanSaveAboutTiles(true);
  };

  const handleEditAboutTile = (idx: number) => {
    setEditingAboutTileIdx(idx);
    setEditingAboutTile(new AboutTile({ ...aboutTiles[idx] }));
  };

  const handleEditAboutTileField = (
    field: "title" | "description",
    value: string,
  ) => {
    if (editingAboutTile) {
      setEditingAboutTile(
        new AboutTile({ ...editingAboutTile, [field]: value }),
      );
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
    prsm!.heroKicker = heroKicker;
    prsm!.heroNote = heroNote;

    if (backgroundImage && typeof backgroundImage !== "string") {
      //delete old photo from storage
      await deletePhoto(prsm!.landingPagePhoto);
      const uploadedPhoto: Photo = await uploadPhoto(
        backgroundImage,
        "Landing Page Background",
      );
      prsm!.landingPagePhoto = uploadedPhoto;
    }
    await updatePRSM(prsm!);
    setCanSaveHero(false);
    setLoadingSaveHero(false);
    setPrsm(PRSM.fromMap(prsm!.toMap())); // Refresh state
  };

  const handleAddGalleryPhoto = async (image: File) => {
    setGalleryPhotos([...galleryPhotos, new GalleryPhoto({ file: image })]);
    setCanSaveGallery(true);
  };

  // Drag-to-reorder state for the gallery grid.
  const galleryDragFrom = useRef<number | null>(null);
  const [galleryDragIdx, setGalleryDragIdx] = useState<number | null>(null);
  const [galleryDropIdx, setGalleryDropIdx] = useState<number | null>(null);

  const handleReorderGalleryPhoto = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setGalleryPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setCanSaveGallery(true);
  };

  const handleDeleteGalleryPhoto = (imageSrc: string | File | undefined) => {
    const updatedPhotos = galleryPhotos.filter((photo) => {
      if (photo.file) {
        return photo.file !== imageSrc;
      } else {
        return photo.url !== imageSrc;
      }
    });
    setGalleryPhotos(updatedPhotos);
    setCanSaveGallery(true);
  };

  const saveGallerySection = async () => {
    setLoadingSaveGallery(true);
    const uploadedPhotos: Photo[] = [];
    for (const photo of galleryPhotos) {
      if (photo.file) {
        const uploadedPhoto: Photo = await uploadPhoto(
          photo.file,
          `Gallery Photo ${Date.now()}`,
        );
        uploadedPhotos.push(uploadedPhoto);
      } else if (photo.url) {
        uploadedPhotos.push(new Photo({ url: photo.url, id: photo.id! })); // Retain existing photos
      }
    }
    //delete old photos from storage that are not in the new gallery
    for (const oldPhoto of prsm!.galleryPhotos) {
      const stillExists = uploadedPhotos.find(
        (photo) => photo.id === oldPhoto.id,
      );
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
  };

  // Socials handlers
  const handleAddSocial = () => {
    if (!newSocial.platform.trim() || !newSocial.url.trim()) return;
    setSocialLinks([
      ...socialLinks,
      new SocialLinkEdit({ platform: newSocial.platform, url: newSocial.url }),
    ]);
    setNewSocial(new SocialLinkEdit({ platform: "", url: "" }));
    setCanSaveSocials(true);
  };

  const handleEditSocial = (idx: number) => {
    setEditingSocialIdx(idx);
    setEditingSocial(new SocialLinkEdit({ ...socialLinks[idx] }));
  };

  const handleEditSocialField = (field: "platform" | "url", value: string) => {
    if (editingSocial) {
      setEditingSocial(
        new SocialLinkEdit({ ...editingSocial, [field]: value }),
      );
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
    prsm!.socialMediaLinks = socialLinks.map(
      (link) => new SocialMediaLink({ platform: link.platform, url: link.url }),
    );
    await updatePRSM(prsm!);
    setCanSaveSocials(false);
    setLoadingSaveSocials(false);
    setPrsm(PRSM.fromMap(prsm!.toMap()));
  };

  const fmtDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCopyEmails = async () => {
    if (!subscribers || subscribers.length === 0) return;
    try {
      await navigator.clipboard.writeText(
        subscribers.map((s) => s.email).join(", "),
      );
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 1800);
    } catch (error) {
      console.error("Could not copy emails:", error);
    }
  };

  const fmtTime = (time: string) => {
    try {
      return new Date("1970-01-01T" + time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return time;
    }
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
        const div = document.createElement("div");
        div.innerHTML = html;
        const text = div.textContent || div.innerText || "";
        return text.length > maxLength
          ? text.substring(0, maxLength) + "..."
          : text;
      };

      const payload = {
        emails: subscribers.join(","),
        title: "PRSM Allergy Monthly Newsletter",
        articleTitle: article.title,
        articlePreview: getExcerpt(article.body),
        articleLink: `${window.location.origin}/Articles/detail.html?id=${article.id}`,
        events: prsm.events
          .filter((_, idx) => !excludedEventIdxs.has(idx))
          .map((event) => ({
            date: `${event.displayDate} • ${new Date("1970-01-01T" + event.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
            title: event.title,
            description: event.description,
          })),
        fundraiserTitle: fundraiser?.name || "",
        fundraiserDescription: fundraiser?.description || "",
        fundraiserLink: fundraiser?.link || "#",
      };

      const functions = getFunctions(app);
      const sendNewsletter = httpsCallable(functions, "sendNewsletter");
      await sendNewsletter(payload);
      setNewsletterStatus("Newsletter sent successfully!");
    } catch (error) {
      console.error("Error sending newsletter:", error);
      setNewsletterStatus("Failed to send newsletter. Please try again.");
    }
    setSendingNewsletter(false);
  };

  const includedCount = prsm ? prsm.events.length - excludedEventIdxs.size : 0;
  const newsletterAlertKind = newsletterStatus
    ? newsletterStatus.includes("success")
      ? "success"
      : newsletterStatus.includes("Failed")
        ? "error"
        : "info"
    : "info";

  return (
    <>
      <Header isDashboardPage={true} />
      <main className="dash">
        <div className="dash-head">
          <p className="kicker">Site content</p>
          <h1>Landing page</h1>
          <p className="dash-head-sub">
            Everything here renders on the public homepage. Each section saves
            on its own and goes live the moment you save it.
          </p>
        </div>

        {!prsm ? (
          <DashboardSkeleton sections={SECTIONS} />
        ) : (
          <>
            <SectionRail
              sections={SECTIONS}
              activeSection={activeSection}
              goToSection={goToSection}
            />

            <div className="dash-main">
              {/* ---- Hero ---- */}
              <Panel
                id="hero"
                title="Hero section"
                desc="The first thing visitors see: headline, supporting line, and the background image behind them."
                action={
                  <SaveButton
                    dirty={canSaveHero}
                    loading={loadingSaveHero}
                    onClick={saveHeroSection}
                  />
                }
              >
                <div className="hero-editor">
                  <div className="hero-fields">
                    <Field label="Kicker" htmlFor="hero-kicker">
                      <input
                        type="text"
                        id="hero-kicker"
                        className="field"
                        value={heroKicker}
                        onChange={(e) => {
                          setHeroKicker(e.target.value);
                          setCanSaveHero(true);
                        }}
                      />
                    </Field>
                    <Field label="Title" htmlFor="hero-title">
                      <input
                        type="text"
                        id="hero-title"
                        className="field"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setCanSaveHero(true);
                        }}
                      />
                    </Field>
                    <Field label="Subtitle" htmlFor="hero-subtitle">
                      <input
                        type="text"
                        id="hero-subtitle"
                        className="field"
                        value={subtitle}
                        onChange={(e) => {
                          setSubtitle(e.target.value);
                          setCanSaveHero(true);
                        }}
                      />
                    </Field>
                    <Field label="Note" htmlFor="hero-note">
                      <input
                        type="text"
                        id="hero-note"
                        className="field"
                        value={heroNote}
                        onChange={(e) => {
                          setHeroNote(e.target.value);
                          setCanSaveHero(true);
                        }}
                      />
                    </Field>
                    <Field
                      label="Image"
                      htmlFor="hero-bg"
                      hint="replaces the current image"
                    >
                      <input
                        type="file"
                        id="hero-bg"
                        accept="image/*"
                        className="field-file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setBackgroundImage(e.target.files[0]);
                            setCanSaveHero(true);
                          }
                        }}
                      />
                    </Field>
                  </div>

                  {/* A faithful miniature of the live hero: same two-column layout,
                      the same framed (uncropped) image, and the real headline copy. */}
                  <div className="hero-preview-col">
                    <span className="form-label">Live preview</span>
                    <div className="hero-mini" aria-hidden="true">
                      <div className="hero-mini-glow" />
                      <div className="hero-mini-content">
                        <p className="hero-mini-kicker">
                          {heroKicker || DEFAULT_COPY.heroKicker}
                        </p>
                        <h3 className="hero-mini-title">
                          {title || "Your headline goes here"}
                        </h3>
                        <p className="hero-mini-lede">
                          {subtitle || "Your supporting line goes here"}
                        </p>
                        <span className="hero-mini-btn">
                          Donate now <span aria-hidden="true">→</span>
                        </span>
                        <p className="hero-mini-note">
                          <span className="hero-mini-note-marker" />
                          {heroNote || DEFAULT_COPY.heroNote}
                        </p>
                      </div>
                      <div className="hero-mini-figure">
                        <div className="hero-mini-frame">
                          {backgroundImage ? (
                            <img
                              src={
                                typeof backgroundImage === "string"
                                  ? backgroundImage
                                  : URL.createObjectURL(backgroundImage)
                              }
                              alt="Hero preview"
                            />
                          ) : (
                            <span className="no-image">No image selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* ---- Gallery ---- */}
              <Panel
                id="gallery"
                title="Gallery photos"
                desc="The photo grid shown on the homepage. Drag a photo to reorder, add or remove images, then save."
                action={
                  <SaveButton
                    dirty={canSaveGallery}
                    loading={loadingSaveGallery}
                    onClick={saveGallerySection}
                  />
                }
              >
                <div className="subblock">
                  <Field label="Kicker" htmlFor="gallery-kicker">
                    <input
                      type="text"
                      id="gallery-kicker"
                      className="field"
                      value={galleryKicker}
                      onChange={(e) => {
                        setGalleryKicker(e.target.value);
                        setCanSaveGalleryCopy(true);
                      }}
                    />
                  </Field>
                  <Field label="Title" htmlFor="gallery-title">
                    <input
                      type="text"
                      id="gallery-title"
                      className="field"
                      value={galleryTitle}
                      onChange={(e) => {
                        setGalleryTitle(e.target.value);
                        setCanSaveGalleryCopy(true);
                      }}
                    />
                  </Field>
                  <Field label="Subtitle" htmlFor="gallery-subtitle">
                    <input
                      type="text"
                      id="gallery-subtitle"
                      className="field"
                      value={gallerySubtitle}
                      onChange={(e) => {
                        setGallerySubtitle(e.target.value);
                        setCanSaveGalleryCopy(true);
                      }}
                    />
                  </Field>
                  <div className="subblock-foot">
                    <SaveButton
                      dirty={canSaveGalleryCopy}
                      loading={loadingSaveGalleryCopy}
                      onClick={saveGalleryCopy}
                      label="Save text"
                    />
                  </div>
                </div>

                {galleryPhotos.length === 0 && (
                  <EmptyState>
                    No gallery photos yet. Use the tile below to add your first
                    one, then save.
                  </EmptyState>
                )}
                <div className="photo-grid">
                  {galleryPhotos.map((photo, idx) => (
                    <div
                      className={`photo${galleryDragIdx === idx ? " is-dragging" : ""}${galleryDropIdx === idx && galleryDragIdx !== idx ? " is-drop-target" : ""}`}
                      key={photo.uid}
                      draggable
                      onDragStart={(e) => {
                        galleryDragFrom.current = idx;
                        setGalleryDragIdx(idx);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (galleryDropIdx !== idx) setGalleryDropIdx(idx);
                      }}
                      onDragLeave={() => {
                        setGalleryDropIdx((cur) => (cur === idx ? null : cur));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (galleryDragFrom.current !== null) {
                          handleReorderGalleryPhoto(galleryDragFrom.current, idx);
                        }
                        galleryDragFrom.current = null;
                        setGalleryDragIdx(null);
                        setGalleryDropIdx(null);
                      }}
                      onDragEnd={() => {
                        galleryDragFrom.current = null;
                        setGalleryDragIdx(null);
                        setGalleryDropIdx(null);
                      }}
                    >
                      <img
                        src={photo.url ?? URL.createObjectURL(photo.file!)}
                        alt="Gallery"
                        draggable={false}
                      />
                      <button
                        className="photo-del"
                        aria-label="Delete photo"
                        title="Delete photo"
                        onClick={() =>
                          handleDeleteGalleryPhoto(photo.file ?? photo.url)
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <label className="photo-add">
                    <span className="photo-add-plus" aria-hidden="true">
                      +
                    </span>
                    Add photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAddGalleryPhoto(e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
              </Panel>

              {/* ---- About ---- */}
              <Panel
                id="about"
                title="About section"
                desc="The mission subtitle and the supporting tiles beneath it."
              >
                <div className="subblock">
                  <Field label="Kicker" htmlFor="about-kicker">
                    <input
                      type="text"
                      id="about-kicker"
                      className="field"
                      value={aboutKicker}
                      onChange={(e) => {
                        setAboutKicker(e.target.value);
                        setCanSaveAboutSubtitle(true);
                      }}
                    />
                  </Field>
                  <Field label="Title" htmlFor="about-title">
                    <input
                      type="text"
                      id="about-title"
                      className="field"
                      value={aboutTitle}
                      onChange={(e) => {
                        setAboutTitle(e.target.value);
                        setCanSaveAboutSubtitle(true);
                      }}
                    />
                  </Field>
                  <Field label="Section subtitle" htmlFor="about-subtitle">
                    <input
                      type="text"
                      id="about-subtitle"
                      className="field"
                      value={aboutSubtitle}
                      onChange={(e) => handleAboutSubtitleChange(e.target.value)}
                    />
                  </Field>
                  <div className="subblock-foot">
                    <SaveButton
                      dirty={canSaveAboutSubtitle}
                      loading={loadingSaveAboutSubtitle}
                      onClick={saveAboutSubtitle}
                      label="Save text"
                    />
                  </div>
                </div>

                <div className="subblock">
                  <div className="subblock-head">
                    <h3>About tiles</h3>
                    <SaveButton
                      dirty={canSaveAboutTiles}
                      loading={loadingSaveAboutTiles}
                      onClick={saveAboutTiles}
                      label="Save tiles"
                    />
                  </div>

                  {aboutTiles.length === 0 ? (
                    <EmptyState>
                      No tiles yet. Add a title and description below to build
                      one.
                    </EmptyState>
                  ) : (
                    <div className="row-list">
                      {aboutTiles.map((tile, idx) =>
                        editingAboutTileIdx === idx ? (
                          <div className="row is-editing" key={idx}>
                            <div className="row-edit-fields">
                              <Field label="Title">
                                <input
                                  className="field"
                                  type="text"
                                  value={editingAboutTile?.title || ""}
                                  onChange={(e) =>
                                    handleEditAboutTileField(
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Description">
                                <textarea
                                  className="field"
                                  value={editingAboutTile?.description || ""}
                                  onChange={(e) =>
                                    handleEditAboutTileField(
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                            </div>
                            <div className="row-actions">
                              <button
                                className="btn-quiet"
                                onClick={() => handleSaveAboutTile(idx)}
                              >
                                Done
                              </button>
                              <button
                                className="btn-quiet"
                                onClick={handleCancelEditAboutTile}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="row" key={idx}>
                            <div className="row-info">
                              <span className="row-title">{tile.title}</span>
                              <span className="row-sub">
                                {tile.description}
                              </span>
                            </div>
                            <div className="row-actions">
                              <button
                                className="btn-quiet"
                                onClick={() => handleEditAboutTile(idx)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-quiet is-danger"
                                onClick={() => handleDeleteAboutTile(idx)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <div className="add-row">
                    <Field label="Title">
                      <input
                        className="field"
                        type="text"
                        placeholder="e.g. Patient education"
                        value={newAboutTile.title}
                        onChange={(e) =>
                          setNewAboutTile(
                            new AboutTile({
                              ...newAboutTile,
                              title: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <input
                        className="field"
                        type="text"
                        placeholder="One supporting sentence"
                        value={newAboutTile.description}
                        onChange={(e) =>
                          setNewAboutTile(
                            new AboutTile({
                              ...newAboutTile,
                              description: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <button className="btn-quiet" onClick={handleAddAboutTile}>
                      Add tile
                    </button>
                  </div>
                </div>
              </Panel>

              {/* ---- Featured fundraiser ---- */}
              <Panel
                id="fundraiser"
                title="Featured fundraiser"
                desc="The small label above the featured fundraiser on the homepage."
                action={
                  <SaveButton
                    dirty={canSaveFundraiserCopy}
                    loading={loadingSaveFundraiserCopy}
                    onClick={saveFundraiserCopy}
                  />
                }
              >
                <Field label="Kicker" htmlFor="fundraiser-kicker">
                  <input
                    type="text"
                    id="fundraiser-kicker"
                    className="field"
                    value={fundraiserKicker}
                    onChange={(e) => {
                      setFundraiserKicker(e.target.value);
                      setCanSaveFundraiserCopy(true);
                    }}
                  />
                </Field>
              </Panel>

              {/* ---- Events intro ---- */}
              <Panel
                id="events-intro"
                title="Upcoming events intro"
                desc="The heading and supporting line above the events list on the homepage."
                action={
                  <SaveButton
                    dirty={canSaveUpcomingEventsSubtitle}
                    loading={loadingSaveUpcomingEventsSubtitle}
                    onClick={saveUpcomingEventsSubtitle}
                  />
                }
              >
                <Field label="Kicker" htmlFor="events-kicker">
                  <input
                    type="text"
                    id="events-kicker"
                    className="field"
                    value={eventsKicker}
                    onChange={(e) => {
                      setEventsKicker(e.target.value);
                      setCanSaveUpcomingEventsSubtitle(true);
                    }}
                  />
                </Field>
                <Field label="Title" htmlFor="events-title">
                  <input
                    type="text"
                    id="events-title"
                    className="field"
                    value={eventsTitle}
                    onChange={(e) => {
                      setEventsTitle(e.target.value);
                      setCanSaveUpcomingEventsSubtitle(true);
                    }}
                  />
                </Field>
                <Field label="Subtitle" htmlFor="events-subtitle">
                  <input
                    type="text"
                    id="events-subtitle"
                    className="field"
                    value={upcomingEventsSubtitle}
                    onChange={(e) =>
                      handleUpcomingEventsSubtitleChange(e.target.value)
                    }
                  />
                </Field>
              </Panel>

              {/* ---- Newsletter section copy ---- */}
              <Panel
                id="newsletter-copy"
                title="Newsletter section"
                desc="The heading and supporting line above the newsletter sign-up form on the homepage."
                action={
                  <SaveButton
                    dirty={canSaveNewsletterCopy}
                    loading={loadingSaveNewsletterCopy}
                    onClick={saveNewsletterCopy}
                  />
                }
              >
                <Field label="Kicker" htmlFor="newsletter-copy-kicker">
                  <input
                    type="text"
                    id="newsletter-copy-kicker"
                    className="field"
                    value={newsletterKicker}
                    onChange={(e) => {
                      setNewsletterKicker(e.target.value);
                      setCanSaveNewsletterCopy(true);
                    }}
                  />
                </Field>
                <Field label="Title" htmlFor="newsletter-copy-title">
                  <input
                    type="text"
                    id="newsletter-copy-title"
                    className="field"
                    value={newsletterTitle}
                    onChange={(e) => {
                      setNewsletterTitle(e.target.value);
                      setCanSaveNewsletterCopy(true);
                    }}
                  />
                </Field>
                <Field label="Subtitle" htmlFor="newsletter-copy-subtitle">
                  <input
                    type="text"
                    id="newsletter-copy-subtitle"
                    className="field"
                    value={newsletterSubtitle}
                    onChange={(e) => {
                      setNewsletterSubtitle(e.target.value);
                      setCanSaveNewsletterCopy(true);
                    }}
                  />
                </Field>
              </Panel>

              {/* ---- Contact section copy ---- */}
              <Panel
                id="contact"
                title="Contact section"
                desc="The heading and supporting line above the contact form on the homepage."
                action={
                  <SaveButton
                    dirty={canSaveContactCopy}
                    loading={loadingSaveContactCopy}
                    onClick={saveContactCopy}
                  />
                }
              >
                <Field label="Kicker" htmlFor="contact-kicker">
                  <input
                    type="text"
                    id="contact-kicker"
                    className="field"
                    value={contactKicker}
                    onChange={(e) => {
                      setContactKicker(e.target.value);
                      setCanSaveContactCopy(true);
                    }}
                  />
                </Field>
                <Field label="Title" htmlFor="contact-title">
                  <input
                    type="text"
                    id="contact-title"
                    className="field"
                    value={contactTitle}
                    onChange={(e) => {
                      setContactTitle(e.target.value);
                      setCanSaveContactCopy(true);
                    }}
                  />
                </Field>
                <Field label="Subtitle" htmlFor="contact-subtitle">
                  <input
                    type="text"
                    id="contact-subtitle"
                    className="field"
                    value={contactSubtitle}
                    onChange={(e) => {
                      setContactSubtitle(e.target.value);
                      setCanSaveContactCopy(true);
                    }}
                  />
                </Field>
              </Panel>

              {/* ---- Footer copy ---- */}
              <Panel
                id="footer"
                title="Footer"
                desc="The mission tagline and the fine print at the bottom of every page."
                action={
                  <SaveButton
                    dirty={canSaveFooterCopy}
                    loading={loadingSaveFooterCopy}
                    onClick={saveFooterCopy}
                  />
                }
              >
                <Field label="Mission tagline" htmlFor="footer-mission">
                  <input
                    type="text"
                    id="footer-mission"
                    className="field"
                    value={footerMission}
                    onChange={(e) => {
                      setFooterMission(e.target.value);
                      setCanSaveFooterCopy(true);
                    }}
                  />
                </Field>
                <Field label="Fine print" htmlFor="footer-fine">
                  <textarea
                    id="footer-fine"
                    className="field"
                    rows={3}
                    value={footerFine}
                    onChange={(e) => {
                      setFooterFine(e.target.value);
                      setCanSaveFooterCopy(true);
                    }}
                  />
                </Field>
              </Panel>

              {/* ---- Social links ---- */}
              <Panel
                id="socials"
                title="Social media links"
                desc="Links shown in the footer and shared across the site."
                action={
                  <SaveButton
                    dirty={canSaveSocials}
                    loading={loadingSaveSocials}
                    onClick={saveSocialsSection}
                  />
                }
              >
                {socialLinks.length === 0 ? (
                  <EmptyState>
                    No social links yet. Add a platform and URL below.
                  </EmptyState>
                ) : (
                  <div className="row-list">
                    {socialLinks.map((link, idx) =>
                      editingSocialIdx === idx ? (
                        <div className="row is-editing" key={idx}>
                          <div className="row-edit-fields">
                            <Field label="Platform">
                              <input
                                className="field"
                                type="text"
                                value={editingSocial?.platform || ""}
                                onChange={(e) =>
                                  handleEditSocialField(
                                    "platform",
                                    e.target.value,
                                  )
                                }
                              />
                            </Field>
                            <Field label="URL">
                              <input
                                className="field"
                                type="text"
                                value={editingSocial?.url || ""}
                                onChange={(e) =>
                                  handleEditSocialField("url", e.target.value)
                                }
                              />
                            </Field>
                          </div>
                          <div className="row-actions">
                            <button
                              className="btn-quiet"
                              onClick={() => handleSaveSocial(idx)}
                            >
                              Done
                            </button>
                            <button
                              className="btn-quiet"
                              onClick={handleCancelEditSocial}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="row" key={idx}>
                          <div className="row-info">
                            <span className="row-title">{link.platform}</span>
                            <span className="row-sub">{link.url}</span>
                          </div>
                          <div className="row-actions">
                            <button
                              className="btn-quiet"
                              onClick={() => handleEditSocial(idx)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-quiet is-danger"
                              onClick={() => handleDeleteSocial(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="add-row">
                  <Field label="Platform">
                    <input
                      className="field"
                      type="text"
                      placeholder="e.g. Instagram"
                      value={newSocial.platform}
                      onChange={(e) =>
                        setNewSocial(
                          new SocialLinkEdit({
                            ...newSocial,
                            platform: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <Field label="URL">
                    <input
                      className="field"
                      type="text"
                      placeholder="https://"
                      value={newSocial.url}
                      onChange={(e) =>
                        setNewSocial(
                          new SocialLinkEdit({
                            ...newSocial,
                            url: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <button className="btn-quiet" onClick={handleAddSocial}>
                    Add link
                  </button>
                </div>
              </Panel>

              {/* ---- Subscribers ---- */}
              <Panel
                id="subscribers"
                title="Newsletter subscribers"
                desc={
                  subscribers === null
                    ? "Everyone who has signed up to receive the newsletter."
                    : `${subscribers.length} ${
                        subscribers.length === 1 ? "person has" : "people have"
                      } signed up to receive the newsletter.`
                }
                action={
                  subscribers && subscribers.length > 0 ? (
                    <button className="btn-quiet" onClick={handleCopyEmails}>
                      {copiedEmails ? "Copied" : "Copy emails"}
                    </button>
                  ) : undefined
                }
              >
                {subscribers === null ? (
                  <div className="subs-loading" role="status" aria-live="polite">
                    <span className="spinner-sm" aria-hidden="true" />
                    Loading subscribers…
                  </div>
                ) : subscribers.length === 0 ? (
                  <EmptyState>
                    No subscribers yet. Sign-ups from the newsletter form will
                    appear here.
                  </EmptyState>
                ) : (
                  <ol
                    className="row-list subs-list"
                    aria-label="Newsletter subscribers"
                  >
                    {subscribers.map((sub, idx) => (
                      <li className="row subs-row" key={`${sub.email}-${idx}`}>
                        <span className="subs-index" aria-hidden="true">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="row-info">
                          <span className="row-title">{sub.email}</span>
                          {fmtDate(sub.subscribedAt) && (
                            <span className="row-sub">
                              Subscribed {fmtDate(sub.subscribedAt)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Panel>

              {/* ---- Newsletter ---- */}
              <Panel
                id="newsletter"
                title="Send newsletter"
                desc="Email every subscriber a featured article, the upcoming events, and a fundraiser."
              >
                <Field label="Featured article" htmlFor="newsletter-article">
                  <select
                    id="newsletter-article"
                    className="field"
                    value={selectedArticleIdx}
                    onChange={(e) =>
                      setSelectedArticleIdx(Number(e.target.value))
                    }
                  >
                    {articles.length === 0 && (
                      <option>No articles available</option>
                    )}
                    {articles.map((article, idx) => (
                      <option key={article.id} value={idx}>
                        {article.title}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="field-group">
                  <span className="form-label">
                    Events to include
                    <span className="form-hint">
                      {" "}
                      · {includedCount} of {prsm.events.length} selected
                    </span>
                  </span>
                  {prsm.events.length === 0 ? (
                    <EmptyState>No events to include.</EmptyState>
                  ) : (
                    <div className="nl-events">
                      {prsm.events.map((event, idx) => {
                        const excluded = excludedEventIdxs.has(idx);
                        return (
                          <label
                            key={idx}
                            className={`nl-event${excluded ? " is-excluded" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="nl-check"
                              checked={!excluded}
                              onChange={() => {
                                setExcludedEventIdxs((prev) => {
                                  const next = new Set(prev);
                                  if (excluded) next.delete(idx);
                                  else next.add(idx);
                                  return next;
                                });
                              }}
                            />
                            <div className="nl-event-info">
                              <span className="row-title">{event.title}</span>
                              <span className="row-sub">
                                {event.displayDate} · {fmtTime(event.time)}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Field
                  label="Featured fundraiser"
                  htmlFor="newsletter-fundraiser"
                >
                  <select
                    id="newsletter-fundraiser"
                    className="field"
                    value={selectedFundraiserIdx}
                    onChange={(e) =>
                      setSelectedFundraiserIdx(Number(e.target.value))
                    }
                  >
                    {prsm.fundraisers.length === 0 && (
                      <option>No fundraisers available</option>
                    )}
                    {prsm.fundraisers.map((fundraiser, idx) => (
                      <option key={idx} value={idx}>
                        {fundraiser.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="newsletter-foot">
                  <button
                    className="btn-primary"
                    onClick={handleSendNewsletter}
                    disabled={articles.length === 0 || sendingNewsletter}
                  >
                    {sendingNewsletter ? (
                      <>
                        <span className="spinner-sm" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      "Send newsletter"
                    )}
                  </button>
                  {newsletterStatus && (
                    <div
                      className={`alert alert-${newsletterAlertKind}`}
                      role="status"
                    >
                      {newsletterStatus}
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
