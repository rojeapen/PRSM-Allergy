import type { DocumentData } from "firebase/firestore";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ORIGIN = '/';

export class Fundraiser {
    name: string;
    description: string;
    photo: Photo;
    link: string;
    isFeatured: boolean;

    constructor({
        name, description, photo, link, isFeatured
    }: { name: string; description: string; photo: Photo; link: string, isFeatured?: boolean }) {
        this.name = name;
        this.description = description;
        this.photo = photo;
        this.link = link;
        this.isFeatured = isFeatured ?? false;
    }

    toMap(): Record<string, any> {
        return {
            name: this.name,
            description: this.description,
            photo: this.photo.toMap(),
            link: this.link,
            isFeatured: this.isFeatured,
        };
    }

    static fromMap(data: DocumentData): Fundraiser {
        return new Fundraiser({
            name: data.name,
            description: data.description,
            photo: Photo.fromMap(data.photo),
            link: data.link,
            isFeatured: data.isFeatured ?? false,
        });
    }
}

export class Event {
    title: string;
    description: string;
    date: string;
    displayDate: string;
    time: string;
    location: string;
    photoUrl: string;
    photoPosX: number;
    photoPosY: number;
    photoZoom: number;


    constructor({
        title, description, date, displayDate, time, location, photoUrl, photoPosX, photoPosY, photoZoom
    }: {
        title: string;
        description: string;
        date: string;
        displayDate: string;
        time: string;
        location: string;
        photoUrl: string;
        photoPosX?: number;
        photoPosY?: number;
        photoZoom?: number;

    }) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.displayDate = displayDate;
        this.time = time;
        this.location = location;
        this.photoUrl = photoUrl;
        this.photoPosX = photoPosX ?? 50;
        this.photoPosY = photoPosY ?? 50;
        this.photoZoom = photoZoom ?? 1;

    }

    getFormattedTime(): string {
        if (!this.time) return '';
        const [hours, minutes] = this.time.split(':');
        const hour = parseInt(hours, 10);
        const meridiem = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${meridiem}`;
    }

    toMap(): Record<string, any> {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            displayDate: this.displayDate,
            time: this.time,
            location: this.location,
            photoUrl: this.photoUrl,
            photoPosX: this.photoPosX,
            photoPosY: this.photoPosY,
            photoZoom: this.photoZoom,

        };
    }

    static fromMap(data: DocumentData): Event {
        return new Event({
            title: data.title,
            description: data.description,
            date: data.date,
            displayDate: data.displayDate,
            time: data.time,
            location: data.location,
            photoUrl: data.photoUrl,
            photoPosX: data.photoPosX,
            photoPosY: data.photoPosY,
            photoZoom: data.photoZoom,

        });
    }
}

export class Photo {
    url: string;
    id: string;

    constructor({ url, id }: { url: string; id: string }) {
        this.url = url;
        this.id = id;
    }

    toMap(): Record<string, string> {
        return {
            url: this.url,
            id: this.id,
        };
    }

    static fromMap(data: DocumentData): Photo {

        return new Photo({
            url: data.url,
            id: data.id,
        });
    }
}

export class SocialMediaLink {
    platform: string;
    url: string;

    constructor({ platform, url }: { platform: string; url: string }) {
        this.platform = platform;
        this.url = url;
    }

    toMap(): Record<string, string> {
        return {
            platform: this.platform,
            url: this.url,
        };
    }

    static fromMap(data: DocumentData): SocialMediaLink {
        return new SocialMediaLink({
            platform: data.platform,
            url: data.url,
        });
    }
}

export class TeamMember {
    name: string;
    photo: Photo;
    description: string;
    role: string;

    constructor({ name, photo, description, role }: { name: string; photo: Photo; description: string; role: string }) {
        this.name = name;
        this.photo = photo;
        this.description = description;
        this.role = role;
    }

    toMap(): Record<string, any> {
        return {
            name: this.name,
            photo: this.photo.toMap(),
            description: this.description,
            role: this.role,
        };
    }

    static fromMap(data: DocumentData): TeamMember {
        return new TeamMember({
            name: data.name,
            photo: Photo.fromMap(data.photo),
            description: data.description,
            role: data.role ?? '',
        });
    }
}

export class AboutTile {
    title: string;
    description: string;

    constructor({ title, description }: { title: string; description: string }) {
        this.title = title;
        this.description = description;
    }

    toMap(): Record<string, string> {
        return {
            title: this.title,
            description: this.description,
        };
    }

    static fromMap(data: DocumentData): AboutTile {
        return new AboutTile({
            title: data.title,
            description: data.description,
        });
    }
}

export class Article {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    mainImage?: Photo;

    constructor({ id, title, body, createdAt, updatedAt, mainImage }: {
        id: string; title: string; body: string; createdAt: string; updatedAt: string; mainImage?: Photo;
    }) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.mainImage = mainImage;
    }

    toMap(): Record<string, any> {
        return {
            title: this.title,
            body: this.body,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ...(this.mainImage ? { mainImage: this.mainImage.toMap() } : {}),
        };
    }

    static fromMap(data: DocumentData, id: string): Article {
        return new Article({
            id,
            title: data.title,
            body: data.body,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            mainImage: data.mainImage ? Photo.fromMap(data.mainImage) : undefined,
        });
    }

    getDisplayDate(): string {
        const date = new Date(this.updatedAt);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

export class PRSM {
    events: Event[];
    fundraisers: Fundraiser[];
    landingPageTitle: string;
    landingPageSubtitle: string;
    landingPagePhoto: Photo;
    galleryPhotos: Photo[];
    socialMediaLinks: SocialMediaLink[];
    teamMembers: TeamMember[];
    aboutSubtitle: string;
    aboutTiles: AboutTile[];
    upcomingEventsSubtitle?: string;
    fundraisersSubtitle?: string;
    articlesSubtitle?: string;
    teamSubtitle?: string;
    ourStory?: string;

    constructor({
        events,
        fundraisers,
        landingPageTitle,
        landingPageSubtitle,
        landingPagePhoto,
        galleryPhotos,
        socialMediaLinks,
        teamMembers,
        aboutSubtitle,
        aboutTiles,
        upcomingEventsSubtitle,
        fundraisersSubtitle,
        articlesSubtitle,
        teamSubtitle,
        ourStory,
    }: {
        events: Event[];
        fundraisers: Fundraiser[];
        landingPageTitle: string;
        landingPageSubtitle: string;
        landingPagePhoto: Photo;
        galleryPhotos: Photo[];
        socialMediaLinks: SocialMediaLink[];
        teamMembers: TeamMember[];
        aboutSubtitle: string;
        aboutTiles: AboutTile[];
        upcomingEventsSubtitle?: string;
        fundraisersSubtitle?: string;
        articlesSubtitle?: string;
        teamSubtitle?: string;
        ourStory?: string;
    }) {
        this.events = events;
        this.fundraisers = fundraisers;
        this.landingPageTitle = landingPageTitle;
        this.landingPageSubtitle = landingPageSubtitle;
        this.landingPagePhoto = landingPagePhoto;
        this.galleryPhotos = galleryPhotos;
        this.socialMediaLinks = socialMediaLinks;
        this.teamMembers = teamMembers;
        this.aboutSubtitle = aboutSubtitle;
        this.aboutTiles = aboutTiles;
        this.upcomingEventsSubtitle = upcomingEventsSubtitle;
        this.fundraisersSubtitle = fundraisersSubtitle;
        this.articlesSubtitle = articlesSubtitle;
        this.teamSubtitle = teamSubtitle;
        this.ourStory = ourStory;
    }

    toMap(): Record<string, any> {
        return {
            events: this.events.map(event => event.toMap()),
            fundraisers: this.fundraisers.map(fundraiser => fundraiser.toMap()),
            landingPageTitle: this.landingPageTitle,
            landingPageSubtitle: this.landingPageSubtitle,
            landingPagePhoto: this.landingPagePhoto.toMap(),
            galleryPhotos: this.galleryPhotos.map(photo => photo.toMap()),
            socialMediaLinks: this.socialMediaLinks.map(link => link.toMap()),
            teamMembers: this.teamMembers.map(member => member.toMap()),
            aboutSubtitle: this.aboutSubtitle,
            aboutTiles: this.aboutTiles.map(tile => tile.toMap()),
            upcomingEventsSubtitle: this.upcomingEventsSubtitle ?? '',
            fundraisersSubtitle: this.fundraisersSubtitle ?? '',
            articlesSubtitle: this.articlesSubtitle ?? '',
            teamSubtitle: this.teamSubtitle ?? '',
            ourStory: this.ourStory ?? '',
        };
    }

    static fromMap(data: DocumentData): PRSM {
        return new PRSM({
            events: data.events.map((eventData: DocumentData) => Event.fromMap(eventData)),
            fundraisers: data.fundraisers.map((fundraiserData: DocumentData) => Fundraiser.fromMap(fundraiserData)),
            landingPageTitle: data.landingPageTitle,
            landingPageSubtitle: data.landingPageSubtitle,
            landingPagePhoto: Photo.fromMap(data.landingPagePhoto),
            galleryPhotos: data.galleryPhotos.map((photoData: DocumentData) => Photo.fromMap(photoData)),
            socialMediaLinks: data.socialMediaLinks.map((linkData: DocumentData) => SocialMediaLink.fromMap(linkData)),
            teamMembers: data.teamMembers.map((memberData: DocumentData) => TeamMember.fromMap(memberData)),
            aboutSubtitle: data.aboutSubtitle,
            aboutTiles: data.aboutTiles.map((tileData: DocumentData) => AboutTile.fromMap(tileData)),
            upcomingEventsSubtitle: data.upcomingEventsSubtitle,
            fundraisersSubtitle: data.fundraisersSubtitle,
            articlesSubtitle: data.articlesSubtitle,
            teamSubtitle: data.teamSubtitle,
            ourStory: data.ourStory,
        });
    }

}