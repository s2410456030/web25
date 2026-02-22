import { model } from '../model/model.js';

class SidebarView extends HTMLElement {
    // Aktuell aktive Filter
    #filters = { status: null, participantId: null, tagId: null };

    constructor() {
        super();
    }

    connectedCallback() {
        model.addEventListener('loaded', () => this.render());
        model.addEventListener('eventsChanged', () => this.#updateCounts());
        model.addEventListener('tagsChanged', () => this.render());
    }

    get filters() {
        return { ...this.#filters };
    }

    render() {
        this.innerHTML = `
            <div class="sidebar">
                <div class="sidebar__section">
                    <button class="sidebar__add-btn" id="btn-add-event">
                        <span>+</span> Neues Event
                    </button>
                </div>

                <div class="sidebar__section">
                    <p class="sidebar__title">Status</p>
                    <div class="filter-group">
                        <button class="filter-chip ${!this.#filters.status ? 'filter-chip--active' : ''}" data-filter-status="">
                            <span>Alle Events</span>
                            <span class="filter-chip__count" id="count-all">${model.events.length}</span>
                        </button>
                        <button class="filter-chip ${this.#filters.status === 'planned' ? 'filter-chip--active' : ''}" data-filter-status="planned">
                            <span>Geplant</span>
                            <span class="filter-chip__count" id="count-planned">${model.events.filter(e => e.status === 'planned').length}</span>
                        </button>
                        <button class="filter-chip ${this.#filters.status === 'completed' ? 'filter-chip--active' : ''}" data-filter-status="completed">
                            <span>Abgeschlossen</span>
                            <span class="filter-chip__count" id="count-completed">${model.events.filter(e => e.status === 'completed').length}</span>
                        </button>
                    </div>
                </div>

                <div class="sidebar__section">
                    <p class="sidebar__title">Teilnehmer</p>
                    <div class="filter-group">
                        ${model.participants.map(p => `
                            <button class="filter-chip ${this.#filters.participantId === p.id ? 'filter-chip--active' : ''}" data-filter-participant="${p.id}">
                                <span>${p.name}</span>
                                <span class="filter-chip__count">${model.events.filter(e => e.hasParticipant(p.id)).length}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="sidebar__section">
                    <p class="sidebar__title">Tags</p>
                    <div class="tag-list" id="tag-list">
                        ${model.tags.map(tag => `
                            <span class="tag-item ${this.#filters.tagId === tag.id ? 'tag-item--active' : ''}" data-filter-tag="${tag.id}" data-tag-id="${tag.id}">
                                ${tag.name}
                                <button class="tag-item__delete" data-delete-tag="${tag.id}" title="Tag löschen">✕</button>
                            </span>
                        `).join('')}
                    </div>
                    <button class="btn btn--outline" id="btn-add-tag" style="margin-top:0.5rem;font-size:0.75rem;padding:0.3rem 0.75rem;">
                        + Tag hinzufügen
                    </button>
                </div>
            </div>
        `;
        this.#attachListeners();
    }

    #attachListeners() {
        // Status-Filter umschalten
        this.querySelectorAll('[data-filter-status]').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.filterStatus || null;
                this.#filters.status = val;
                this.#dispatchFilterChange();
                this.render();
            });
        });

        // Teilnehmer-Filter umschalten
        this.querySelectorAll('[data-filter-participant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.filterParticipant);
                this.#filters.participantId = this.#filters.participantId === id ? null : id;
                this.#dispatchFilterChange();
                this.render();
            });
        });

        // Tag-Filter umschalten
        this.querySelectorAll('[data-filter-tag]').forEach(span => {
            span.addEventListener('click', (e) => {
                if (e.target.closest('[data-delete-tag]')) return;
                const id = parseInt(span.dataset.filterTag);
                this.#filters.tagId = this.#filters.tagId === id ? null : id;
                this.#dispatchFilterChange();
                this.render();
            });
        });

        // Tag löschen
        this.querySelectorAll('[data-delete-tag]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tagId = parseInt(btn.dataset.deleteTag);
                this.dispatchEvent(new CustomEvent('delete-tag', {
                    detail: { tagId },
                    bubbles: true
                }));
            });
        });

        this.querySelector('#btn-add-event')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('add-event', { bubbles: true }));
        });

        this.querySelector('#btn-add-tag')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('add-tag', { bubbles: true }));
        });
    }

    #dispatchFilterChange() {
        this.dispatchEvent(new CustomEvent('filter-change', {
            detail: { ...this.#filters },
            bubbles: true
        }));
    }

    #updateCounts() {
        this.render();
    }
}

customElements.define('sidebar-view', SidebarView);
