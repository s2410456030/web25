export class EventItem {
    #id;
    #title;
    #date;
    #time;
    #location;
    #description;
    #status;
    #icon;
    #tagIds;
    #participantIds;

    constructor({ id, title, date, time, location, description, status, icon, tagIds = [], participantIds = [] }) {
        this.#id = id;
        this.#title = title;
        this.#date = date;
        this.#time = time;
        this.#location = location;
        this.#description = description;
        this.#status = status;
        this.#icon = icon || '📅';
        this.#tagIds = [...tagIds];
        this.#participantIds = [...participantIds];
    }

    // Getter
    get id() { return this.#id; }
    get title() { return this.#title; }
    get date() { return this.#date; }
    get time() { return this.#time; }
    get location() { return this.#location; }
    get description() { return this.#description; }
    get status() { return this.#status; }
    get icon() { return this.#icon; }
    get tagIds() { return [...this.#tagIds]; }
    get participantIds() { return [...this.#participantIds]; }

    // Setter
    set title(v) { this.#title = v; }
    set date(v) { this.#date = v; }
    set time(v) { this.#time = v; }
    set location(v) { this.#location = v; }
    set description(v) { this.#description = v; }
    set status(v) { this.#status = v; }
    set icon(v) { this.#icon = v; }
    set tagIds(v) { this.#tagIds = [...v]; }
    set participantIds(v) { this.#participantIds = [...v]; }

    // Tag Hilfsmethoden
    hasTag(tagId) { return this.#tagIds.includes(tagId); }
    addTag(tagId) { if (!this.hasTag(tagId)) this.#tagIds.push(tagId); }
    removeTag(tagId) { this.#tagIds = this.#tagIds.filter(id => id !== tagId); }

    // Teilnehmer Hilfsmethoden
    hasParticipant(participantId) { return this.#participantIds.includes(participantId); }
    addParticipant(participantId) { if (!this.hasParticipant(participantId)) this.#participantIds.push(participantId); }
    removeParticipant(participantId) { this.#participantIds = this.#participantIds.filter(id => id !== participantId); }

    toJSON() {
        return {
            id: this.#id,
            title: this.#title,
            date: this.#date,
            time: this.#time,
            location: this.#location,
            description: this.#description,
            status: this.#status,
            icon: this.#icon,
            tagIds: this.#tagIds,
            participantIds: this.#participantIds
        };
    }
}
