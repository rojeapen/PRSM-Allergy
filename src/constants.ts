/* eslint-disable @typescript-eslint/no-explicit-any */
export const ORIGIN = '/PRSM-Allergy/';

export class Fundraiser {
    name: string;
    description: string;
    photoUrl: string;
    link: string;

    constructor({
        name, description, photoUrl, link
    }: { name: string; description: string; photoUrl: string; link: string }) {
        this.name = name;
        this.description = description;
        this.photoUrl = photoUrl;
        this.link = link;
    }

    toMap(): Record<string, string> {
        return {
            name: this.name,
            description: this.description,
            photoUrl: this.photoUrl,
            link: this.link,
        };
    }

    static fromMap(data: any): Fundraiser {
        return new Fundraiser({
            name: data.name,
            description: data.description,
            photoUrl: data.photoUrl,
            link: data.link,
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
    attendees?: number;
    capacity?: number;

    constructor({
        title, description, date, displayDate, time, location, photoUrl, attendees, capacity
    }: {
        title: string;
        description: string;
        date: string;
        displayDate: string;
        time: string;
        location: string;
        photoUrl: string;
        attendees?: number;
        capacity?: number;
    }) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.displayDate = displayDate;
        this.time = time;
        this.location = location;
        this.photoUrl = photoUrl;
        this.attendees = attendees;
        this.capacity = capacity;
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
            attendees: this.attendees,
            capacity: this.capacity,
        };
    }

    static fromMap(data: any): Event {
        return new Event({
            title: data.title,
            description: data.description,
            date: data.date,
            displayDate: data.displayDate,
            time: data.time,
            location: data.location,
            photoUrl: data.photoUrl,
            attendees: data.attendees,
            capacity: data.capacity,
        });
    }
}