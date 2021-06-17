import { Component } from '@angular/core';
import { SettingsService } from '../_services/settings.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
    dark: boolean = false;
    constructor(private settings: SettingsService) {
        this.dark = this.settings.theme == 'dark';
    }


    toggleTheme(ev: any) {
        console.log(ev);
        this.settings.theme = ev.detail.checked ? 'dark' : 'light';
    }
}
