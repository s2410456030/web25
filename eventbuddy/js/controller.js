import { model } from './model/model.js';

class Controller {
    #sidebar;
    #listView;
    #detailView;
    #modalView;
    #mainPanel;

    constructor() {}

    init() {
        this.#sidebar    = document.querySelector('sidebar-view');
        this.#listView   = document.querySelector('event-list-view');
        this.#detailView = document.querySelector('event-detail-view');
        this.#modalView  = document.querySelector('modal-view');
        this.#mainPanel  = document.querySelector('.app__main');

        this.#showList();
        this.#attachListeners();
    }

    //Navigation

    //Zeigt Event-Liste
    #showList() {
        this.#listView.classList.remove('hidden');
        this.#detailView.classList.add('hidden');
    }

    //Detailansicht Event 
    #showDetail(eventId) {
        const ev = model.getEventById(eventId);
        if (!ev) return;
        this.#detailView.event = ev;
        this.#listView.classList.add('hidden');
        this.#detailView.classList.remove('hidden');
        this.#mainPanel.scrollTop = 0;
    }

    //Event Listeners

    #attachListeners() {
        document.addEventListener('filter-change', (e) => {
            this.#listView.filters = e.detail;
        });

        document.addEventListener('open-event', (e) => {
            this.#showDetail(e.detail.eventId);
        });

        document.addEventListener('back', () => {
            this.#showList();
        });

        document.addEventListener('add-event', () => {
            this.#modalView.showEventForm(null);
        });

        document.addEventListener('create-event', (e) => {
            const ev = model.addEvent(e.detail);
        });

        document.addEventListener('edit-event', (e) => {
            const ev = model.getEventById(e.detail.eventId);
            if (ev) this.#modalView.showEventForm(ev);
        });

        document.addEventListener('save-event', (e) => {
            const { id, ...data } = e.detail;
            model.updateEvent(id, data);
            const updated = model.getEventById(id);
            if (updated && !this.#detailView.classList.contains('hidden')) {
                this.#detailView.event = updated;
            }
        });

        document.addEventListener('delete-event', (e) => {
            const ev = model.getEventById(e.detail.eventId);
            if (!ev) return;
            this.#modalView.showConfirm({
                title: 'Event löschen?',
                text: `„${ev.title}\" wird unwiderruflich gelöscht.`,
                icon: '🗑️',
                onConfirm: () => {
                    model.deleteEvent(ev.id);
                    this.#showList();
                }
            });
        });

        document.addEventListener('add-tag', () => {
            this.#modalView.showTagForm();
        });

        document.addEventListener('create-tag', (e) => {
            model.addTag(e.detail.name);
        });

        document.addEventListener('delete-tag', (e) => {
            const tagId = e.detail.tagId;
            const tag = model.getTagById(tagId);
            if (!tag) return;
            try {
                const inUse = model.events.some(ev => ev.hasTag(tagId));
                if (inUse) {
                    this.#modalView.showError('Tag wird noch von Events verwendet und kann nicht gelöscht werden.');
                    return;
                }
                this.#modalView.showConfirm({
                    title: 'Tag löschen?',
                    text: `Tag „${tag.name}\" wird gelöscht.`,
                    icon: '🏷️',
                    onConfirm: () => {
                        try {
                            model.deleteTag(tagId);
                        } catch (err) {
                            this.#modalView.showError(err.message);
                        }
                    }
                });
            } catch (err) {
                this.#modalView.showError(err.message);
            }
        });

        document.addEventListener('manage-participants', (e) => {
            const ev = model.getEventById(e.detail.eventId);
            if (ev) this.#modalView.showParticipantManager(ev);
        });

        document.addEventListener('update-participants', (e) => {
            const { eventId, participantIds } = e.detail;
            model.updateEvent(eventId, { participantIds });
            const updated = model.getEventById(eventId);
            if (updated && !this.#detailView.classList.contains('hidden')) {
                this.#detailView.event = updated;
            }
        });

        model.addEventListener('eventsChanged', () => {
            if (!this.#listView.classList.contains('hidden')) {
                this.#listView.render();
            }
        });
    }
}

export const controller = new Controller();
