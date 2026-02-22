import { model } from './model/model.js';
import { controller } from './controller.js';
import './views/sidebar-view.js';
import './views/event-list-view.js';
import './views/event-detail-view.js';
import './views/modal-view.js';

model.load().then(() => {
    controller.init();
});
