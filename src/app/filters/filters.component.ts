import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { SettingsService } from "../_services/settings.service";

@Component({
    templateUrl: 'filters.component.html',
    styleUrls: ['filters.component.scss']
})
export class FiltersComponent {
    filters = [
        {
            label: 'Hidden',
            value: 'hidden'
        },
        {
            label: 'Favorites',
            value: 'favorite'
        }
    ];

    constructor(
        private settings: SettingsService,
        private modal: ModalController
        ) {
    }

    toggleFilter(key) {
        if(this.settings.filters[key] === undefined) {
            this.settings.filters[key] = true;
        } else if(this.settings.filters[key]) {
            this.settings.filters[key] = false;
        } else {
            delete this.settings.filters[key];
        }

        this.settings.saveSettings();
    }

    close() {
        this.modal.dismiss();
    }
}
