import { model } from '../model/model.js';

class EventDetailView extends HTMLElement {
    #event = null;

    constructor() {
        super();
    }

    //Setzt das anzuzeigende Event und rendert die Ansicht
    set event(ev) {
        this.#event = ev;
        this.render();
    }

    render() {
        const ev = this.#event;
        if (!ev) { this.innerHTML = ''; return; }

        const tags = ev.tagIds.map(id => model.getTagById(id)).filter(Boolean);
        const participants = ev.participantIds.map(id => model.getParticipantById(id)).filter(Boolean);
        const dateFormatted = ev.date
            ? new Date(ev.date + 'T00:00:00').toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
            : '';

        this.innerHTML = `
            <div class="detail">
                <button class="detail__back" id="btn-back">← Zurück zur Übersicht</button>

                <div class="detail__hero">
                    <div>
                        <span class="detail__icon">${ev.icon}</span>
                        <h1 class="detail__title">${this.#escape(ev.title)}</h1>
                        <span class="event-card__status event-card__status--${ev.status}" style="display:inline-block;margin-top:0.25rem;">
                            ${ev.status === 'planned' ? '📅 Geplant' : '✅ Abgeschlossen'}
                        </span>
                    </div>
                    <div class="detail__actions">
                        <button class="btn btn--outline" id="btn-edit">✏️ Bearbeiten</button>
                        <button class="btn btn--danger" id="btn-delete">🗑️ Löschen</button>
                    </div>
                </div>

                <div class="detail__section">
                    <p class="detail__section-title">Details</p>
                    <div class="detail__info-grid">
                        <div class="detail__info-item">
                            <span class="detail__info-icon">📅</span>
                            <span>${dateFormatted}${ev.time ? ' um ' + ev.time + ' Uhr' : ''}</span>
                        </div>
                        ${ev.location ? `
                        <div class="detail__info-item">
                            <span class="detail__info-icon">📍</span>
                            <span>${this.#escape(ev.location)}</span>
                        </div>` : ''}
                    </div>
                </div>

                ${ev.description ? `
                <div class="detail__section">
                    <p class="detail__section-title">Beschreibung</p>
                    <div class="detail__description">${this.#escape(ev.description)}</div>
                </div>` : ''}

                ${tags.length > 0 ? `
                <div class="detail__section">
                    <p class="detail__section-title">Tags</p>
                    <div class="tag-list">
                        ${tags.map(t => `<span class="tag-item">${t.name}</span>`).join('')}
                    </div>
                </div>` : ''}

                <div class="detail__section">
                    <p class="detail__section-title">Teilnehmer (${participants.length})</p>
                    <div class="detail__participants-list">
                        ${participants.map(p => `
                            <div class="detail__participant-chip">
                                <div class="avatar avatar--sm">${p.avatar}</div>
                                <span>${p.name}</span>
                            </div>
                        `).join('')}
                        <button class="detail__add-participant" id="btn-manage-participants">
                            👤 Teilnehmer verwalten
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.querySelector('#btn-back').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('back', { bubbles: true }));
        });

        this.querySelector('#btn-edit').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit-event', {
                detail: { eventId: ev.id },
                bubbles: true
            }));
        });

        this.querySelector('#btn-delete').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-event', {
                detail: { eventId: ev.id },
                bubbles: true
            }));
        });

        this.querySelector('#btn-manage-participants').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('manage-participants', {
                detail: { eventId: ev.id },
                bubbles: true
            }));
        });
    }

    #escape(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

customElements.define('event-detail-view', EventDetailView);
