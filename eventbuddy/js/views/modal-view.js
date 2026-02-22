import { model } from '../model/model.js';

class ModalView extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `<div class="modal-overlay hidden" id="modal-overlay"></div>`;
    }

    get #overlay() {
        return this.querySelector('#modal-overlay');
    }

    //Schließt Overlay und leert Inhalt
    #close() {
        this.#overlay.classList.add('hidden');
        this.#overlay.innerHTML = '';
    }

    //Event erstellen Overlay
    showEventForm(eventData = null) {
        const isEdit = !!eventData;
        const tags = model.tags;

        const overlay = this.#overlay;
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal__header">
                    <h2>${isEdit ? 'Event bearbeiten' : 'Neues Event'}</h2>
                    <button class="modal__close" id="modal-close">✕</button>
                </div>
                <div class="modal__body">
                    <form class="form" id="event-form" novalidate>
                        <div class="form__row">
                            <div class="form__field">
                                <label class="form__label">Titel *</label>
                                <input class="form__input" name="title" type="text"
                                    value="${eventData ? this.#escape(eventData.title) : ''}"
                                    placeholder="Event-Titel" required>
                                <span class="form__error hidden" id="err-title">Pflichtfeld</span>
                            </div>
                            <div class="form__field">
                                <label class="form__label">Symbol</label>
                                <input class="form__input" name="icon" type="text"
                                    value="${eventData ? eventData.icon : ' '}"
                                    placeholder="Emoji" maxlength="4">
                            </div>
                        </div>
                        <div class="form__row">
                            <div class="form__field">
                                <label class="form__label">Datum *</label>
                                <input class="form__input" name="date" type="date"
                                    value="${eventData ? eventData.date : ''}" required>
                                <span class="form__error hidden" id="err-date">Pflichtfeld</span>
                            </div>
                            <div class="form__field">
                                <label class="form__label">Uhrzeit</label>
                                <input class="form__input" name="time" type="time"
                                    value="${eventData ? eventData.time : ''}">
                            </div>
                        </div>
                        <div class="form__field">
                            <label class="form__label">Ort</label>
                            <input class="form__input" name="location" type="text"
                                value="${eventData ? this.#escape(eventData.location || '') : ''}"
                                placeholder="Veranstaltungsort">
                        </div>
                        <div class="form__field">
                            <label class="form__label">Beschreibung</label>
                            <textarea class="form__textarea" name="description" placeholder="Beschreibung...">${eventData ? this.#escape(eventData.description || '') : ''}</textarea>
                        </div>
                        <div class="form__field">
                            <label class="form__label">Status</label>
                            <select class="form__select" name="status">
                                <option value="planned" ${!eventData || eventData.status === 'planned' ? 'selected' : ''}>Geplant</option>
                                <option value="completed" ${eventData && eventData.status === 'completed' ? 'selected' : ''}>Abgeschlossen</option>
                            </select>
                        </div>
                        ${tags.length > 0 ? `
                        <div class="form__field">
                            <label class="form__label">Tags</label>
                            <div class="tag-list" style="margin-top:0.25rem;">
                                ${tags.map(t => `
                                    <label style="cursor:pointer;">
                                        <input type="checkbox" name="tags" value="${t.id}"
                                            ${eventData && eventData.tagIds.includes(t.id) ? 'checked' : ''}
                                            style="display:none;">
                                        <span class="tag-item ${eventData && eventData.tagIds.includes(t.id) ? 'tag-item--active' : ''}"
                                            data-tag-toggle="${t.id}">${t.name}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>` : ''}
                        <div class="form__actions">
                            <button type="button" class="btn btn--outline" id="btn-cancel">Abbrechen</button>
                            <button type="submit" class="btn btn--primary">${isEdit ? 'Speichern' : 'Erstellen'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        overlay.querySelectorAll('[data-tag-toggle]').forEach(span => {
            span.addEventListener('click', () => {
                const cb = span.closest('label').querySelector('input[type="checkbox"]');
                cb.checked = !cb.checked;
                span.classList.toggle('tag-item--active', cb.checked);
            });
        });

        overlay.querySelector('#modal-close').addEventListener('click', () => this.#close());
        overlay.querySelector('#btn-cancel').addEventListener('click', () => this.#close());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.#close(); });

        //Formular absenden
        overlay.querySelector('#event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            let valid = true;

            const title = form.title.value.trim();
            const date = form.date.value;

            const errTitle = overlay.querySelector('#err-title');
            const errDate = overlay.querySelector('#err-date');

            if (!title) {
                errTitle.classList.remove('hidden');
                form.title.classList.add('form__input--error');
                valid = false;
            } else {
                errTitle.classList.add('hidden');
                form.title.classList.remove('form__input--error');
            }

            if (!date) {
                errDate.classList.remove('hidden');
                form.date.classList.add('form__input--error');
                valid = false;
            } else {
                errDate.classList.add('hidden');
                form.date.classList.remove('form__input--error');
            }

            if (!valid) return;

            const tagIds = [...form.querySelectorAll('input[name="tags"]:checked')].map(cb => parseInt(cb.value));

            const data = {
                title,
                date,
                time: form.time.value,
                location: form.location.value.trim(),
                description: form.description?.value.trim() || '',
                status: form.status.value,
                icon: form.icon.value || '',
                tagIds,
                participantIds: eventData ? eventData.participantIds : []
            };

            this.#close();
            this.dispatchEvent(new CustomEvent(isEdit ? 'save-event' : 'create-event', {
                detail: { id: eventData?.id, ...data },
                bubbles: true
            }));
        });
    }

    //BEstätigungs Dialog
    showConfirm({ title, text, icon = '⚠️', onConfirm }) {
        const overlay = this.#overlay;
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog__icon">${icon}</div>
                <h3 class="confirm-dialog__title">${title}</h3>
                <p class="confirm-dialog__text">${text}</p>
                <div class="confirm-dialog__actions">
                    <button class="btn btn--outline" id="btn-cancel">Abbrechen</button>
                    <button class="btn btn--danger" id="btn-confirm">Löschen</button>
                </div>
            </div>
        `;
        overlay.querySelector('#btn-cancel').addEventListener('click', () => this.#close());
        overlay.querySelector('#btn-confirm').addEventListener('click', () => {
            this.#close();
            onConfirm();
        });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.#close(); });
    }

    //Tag erstellung overlay
    showTagForm() {
        const overlay = this.#overlay;
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="modal" style="max-width:360px;">
                <div class="modal__header">
                    <h2>Neuer Tag</h2>
                    <button class="modal__close" id="modal-close">✕</button>
                </div>
                <div class="modal__body">
                    <form class="form" id="tag-form" novalidate>
                        <div class="form__field">
                            <label class="form__label">Tag-Name *</label>
                            <input class="form__input" name="name" type="text" placeholder="z.B. Party" required autofocus>
                            <span class="form__error hidden" id="err-name">Pflichtfeld</span>
                        </div>
                        <div class="form__actions">
                            <button type="button" class="btn btn--outline" id="btn-cancel">Abbrechen</button>
                            <button type="submit" class="btn btn--primary">Erstellen</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        overlay.querySelector('#modal-close').addEventListener('click', () => this.#close());
        overlay.querySelector('#btn-cancel').addEventListener('click', () => this.#close());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.#close(); });

        overlay.querySelector('#tag-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.name.value.trim();
            if (!name) {
                overlay.querySelector('#err-name').classList.remove('hidden');
                return;
            }
            this.#close();
            this.dispatchEvent(new CustomEvent('create-tag', {
                detail: { name },
                bubbles: true
            }));
        });
    }

    //User managen
    showParticipantManager(event) {
        const overlay = this.#overlay;
        overlay.classList.remove('hidden');

        //Rendert Teilnehmerliste
        const renderList = () => {
            const list = overlay.querySelector('.participant-select');
            if (!list) return;
            list.innerHTML = model.participants.map(p => `
                <div class="participant-select__item ${event.hasParticipant(p.id) ? 'participant-select__item--selected' : ''}"
                    data-participant-id="${p.id}">
                    <div class="participant-select__info">
                        <div class="avatar avatar--sm">${p.avatar}</div>
                        <div>
                            <div style="font-weight:600;font-size:0.875rem;">${p.name}</div>
                            <div style="font-size:0.75rem;color:var(--fg-muted);">${p.email}</div>
                        </div>
                    </div>
                    <span class="participant-select__check">✓</span>
                </div>
            `).join('');
            attachToggle();
        };

        const attachToggle = () => {
            overlay.querySelectorAll('[data-participant-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const pid = parseInt(item.dataset.participantId);
                    if (event.hasParticipant(pid)) {
                        event.removeParticipant(pid);
                    } else {
                        event.addParticipant(pid);
                    }
                    item.classList.toggle('participant-select__item--selected', event.hasParticipant(pid));
                    item.querySelector('.participant-select__check').style.opacity = event.hasParticipant(pid) ? '1' : '0';
                });
            });
        };

        overlay.innerHTML = `
            <div class="modal">
                <div class="modal__header">
                    <h2>Teilnehmer verwalten</h2>
                    <button class="modal__close" id="modal-close">✕</button>
                </div>
                <div class="modal__body">
                    <div class="participant-select"></div>
                    <div class="form__actions" style="margin-top:1rem;">
                        <button class="btn btn--outline" id="btn-cancel">Abbrechen</button>
                        <button class="btn btn--primary" id="btn-save-participants">Speichern</button>
                    </div>
                </div>
            </div>
        `;

        renderList();

        overlay.querySelector('#modal-close').addEventListener('click', () => this.#close());
        overlay.querySelector('#btn-cancel').addEventListener('click', () => { this.#close(); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.#close(); });

        overlay.querySelector('#btn-save-participants').addEventListener('click', () => {
            this.#close();
            this.dispatchEvent(new CustomEvent('update-participants', {
                detail: { eventId: event.id, participantIds: event.participantIds },
                bubbles: true
            }));
        });
    }

    //Error Nachricht
    showError(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;bottom:1.5rem;right:1.5rem;background:var(--danger);color:#fff;
            padding:0.75rem 1.25rem;border-radius:10px;font-size:0.875rem;font-weight:600;
            z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    #escape(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

customElements.define('modal-view', ModalView);
