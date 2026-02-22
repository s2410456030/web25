import { EventItem } from './event.js';
import { Participant } from './participant.js';
import { Tag } from './tag.js';

class AppModel extends EventTarget {
    #events;
    #participants;
    #tags;
    #nextEventId;
    #nextTagId;

    constructor() {
        super();
        this.#events = new Map();
        this.#participants = new Map();
        this.#tags = new Map();
        this.#nextEventId = 1;
        this.#nextTagId = 1;
    }

    //Lädt Daten aus json
    async load() {
        const response = await fetch('json/data.json');
        const data = await response.json();

        for (const u of data.users) {
            const p = new Participant(u);
            this.#participants.set(p.id, p);
        }

        for (const t of data.tags) {
            const tag = new Tag(t);
            this.#tags.set(tag.id, tag);
            if (tag.id >= this.#nextTagId) this.#nextTagId = tag.id + 1;
        }

        for (const e of data.events) {
            const ev = new EventItem(e);
            this.#events.set(ev.id, ev);
            if (ev.id >= this.#nextEventId) this.#nextEventId = ev.id + 1;
        }

        this.dispatchEvent(new CustomEvent('loaded'));
    }

    //Participants
    get participants() {
        return [...this.#participants.values()];
    }

    getParticipantById(id) {
        return this.#participants.get(id);
    }

    //Tags
    get tags() {
        return [...this.#tags.values()];
    }

    getTagById(id) {
        return this.#tags.get(id);
    }

    //Erstellt einen neuen Tag
    addTag(name) {
        const tag = new Tag({ id: this.#nextTagId++, name });
        this.#tags.set(tag.id, tag);
        this.dispatchEvent(new CustomEvent('tagsChanged', { detail: { action: 'add', tag } }));
        return tag;
    }

    //Löscht einen Tag
    deleteTag(tagId) {
        const inUse = [...this.#events.values()].some(e => e.hasTag(tagId));
        if (inUse) throw new Error('Tag wird noch von Events verwendet und kann nicht gelöscht werden.');
        this.#tags.delete(tagId);
        this.dispatchEvent(new CustomEvent('tagsChanged', { detail: { action: 'delete', tagId } }));
    }

    //Events
    get events() {
        return [...this.#events.values()];
    }

    getEventById(id) {
        return this.#events.get(id);
    }

    //Erstellt ein neues Event
    addEvent(data) {
        const ev = new EventItem({ ...data, id: this.#nextEventId++ });
        this.#events.set(ev.id, ev);
        this.dispatchEvent(new CustomEvent('eventsChanged', { detail: { action: 'add', event: ev } }));
        return ev;
    }

    //Aktualisiert die Felder eines bestehenden Events
    updateEvent(id, data) {
        const ev = this.#events.get(id);
        if (!ev) return;
        if (data.title !== undefined) ev.title = data.title;
        if (data.date !== undefined) ev.date = data.date;
        if (data.time !== undefined) ev.time = data.time;
        if (data.location !== undefined) ev.location = data.location;
        if (data.description !== undefined) ev.description = data.description;
        if (data.status !== undefined) ev.status = data.status;
        if (data.icon !== undefined) ev.icon = data.icon;
        if (data.tagIds !== undefined) ev.tagIds = data.tagIds;
        if (data.participantIds !== undefined) ev.participantIds = data.participantIds;
        this.dispatchEvent(new CustomEvent('eventsChanged', { detail: { action: 'update', event: ev } }));
        return ev;
    }

    //Löscht ein Event
    deleteEvent(id) {
        const ev = this.#events.get(id);
        if (!ev) return;
        this.#events.delete(id);
        this.dispatchEvent(new CustomEvent('eventsChanged', { detail: { action: 'delete', eventId: id } }));
    }

    //Filtering
    filterEvents({ status = null, participantId = null, tagId = null } = {}) {
        return this.events.filter(ev => {
            if (status && ev.status !== status) return false;
            if (participantId && !ev.hasParticipant(participantId)) return false;
            if (tagId && !ev.hasTag(tagId)) return false;
            return true;
        });
    }
}

export const model = new AppModel();
