import { model } from '../model/model.js';

class EventListView extends HTMLElement {
    #filters = {};

    constructor() {
        super();
    }

    connectedCallback() {
        model.addEventListener('loaded', () => this.render());
        model.addEventListener('eventsChanged', () => this.render());
    }

    //Setzt neue Filter und rendert die Liste neu
    set filters(f) {
        this.#filters = f;
        this.render();
    }

    render() {
        const events = model.filterEvents(this.#filters);

        this.innerHTML = `
            <div class="event-list">
                <div class="event-list__header">
                    <h2 class="event-list__title">Events</h2>
                    <span class="event-list__count">${events.length} Ergebnis${events.length !== 1 ? 'se' : ''}</span>
                </div>
                <div class="event-list__grid">
                    ${events.length === 0 ? `
                        <div class="event-list__empty">
                            <div class="event-list__empty-icon">🔍</div>
                            <div class="event-list__empty-text">Keine Events gefunden.</div>
                        </div>
                    ` : events.map(ev => this.#renderCard(ev)).join('')}
                </div>
            </div>
        `;
        this.#attachCardListeners();
    }

    //Rendert ein einzelnes Event
    #renderCard(ev) {
        const tags = ev.tagIds.map(id => model.getTagById(id)).filter(Boolean);
        const participants = ev.participantIds.map(id => model.getParticipantById(id)).filter(Boolean);
        const visible = participants.slice(0, 4);
        const overflow = participants.length - visible.length;

        const dateFormatted = ev.date
            ? new Date(ev.date + 'T00:00:00').toLocaleDateString('de-AT', { day: '2-digit', month: 'short', year: 'numeric' })
            : '';

        return `
            <article class="event-card" data-event-id="${ev.id}" role="button" tabindex="0" aria-label="${ev.title}">
                <div class="event-card__header">
                    <span class="event-card__icon">${ev.icon}</span>
                    <span class="event-card__status event-card__status--${ev.status}">
                        ${ev.status === 'planned' ? 'Geplant' : 'Abgeschlossen'}
                    </span>
                </div>
                <h3 class="event-card__title">${this.#escape(ev.title)}</h3>
                <div class="event-card__meta">
                    <div class="event-card__meta-item">
                        <span>📅</span><span>${dateFormatted}${ev.time ? ' · ' + ev.time : ''}</span>
                    </div>
                    ${ev.location ? `<div class="event-card__meta-item"><span>📍</span><span>${this.#escape(ev.location)}</span></div>` : ''}
                </div>
                ${tags.length > 0 ? `
                    <div class="event-card__tags">
                        ${tags.map(t => `<span class="tag-item">${t.name}</span>`).join('')}
                    </div>
                ` : ''}
                ${participants.length > 0 ? `
                    <div class="event-card__participants">
                        ${visible.map(p => `<div class="avatar avatar--sm" title="${p.name}">${p.avatar}</div>`).join('')}
                        ${overflow > 0 ? `<div class="avatar-overflow avatar--sm">+${overflow}</div>` : ''}
                    </div>
                ` : ''}
            </article>
        `;
    }

    #attachCardListeners() {
        this.querySelectorAll('[data-event-id]').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.eventId);
                this.dispatchEvent(new CustomEvent('open-event', {
                    detail: { eventId: id },
                    bubbles: true
                }));
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') card.click();
            });
        });
    }

    #escape(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

customElements.define('event-list-view', EventListView);
