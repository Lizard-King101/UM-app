import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

const DefaultSettings: Settings = {
    theme: 'light',
    volume: 30,
    filters: {}
};

@Injectable()
export class SettingsService {

    set theme(theme: 'light' | 'dark') {
        this.settings.theme = theme;
        this.setTheme(theme);
        this.saveSettings();
    }
    get theme(): 'light' | 'dark' {
        return this.settings ? this.settings.theme : DefaultSettings.theme;
    }

    set volume(volume: number) {
        this.settings.volume = volume;
        this.saveSettings();
    }
    get volume(): number {
        return this.settings ? this.settings.volume : DefaultSettings.volume;
    }

    filters: any = {};

    private settings: Settings;
    constructor(@Inject(DOCUMENT) private document: Document) {
        this.settings = DefaultSettings;
        const settings = JSON.parse(localStorage.getItem('settings'));
        console.log(this.settings);
        if(settings != null) {
            this.theme = settings.theme;
            this.volume = settings.volume;
            this.filters = settings.filters ? settings.filters : {};
        }
    }

    setTheme(theme: 'light' | 'dark') {
        if(theme === 'dark') {
            this.document.body.classList.add('dark');
        } else {
            this.document.body.classList.remove('dark');
        }
    }

    saveSettings() {
        this.settings.filters = this.filters;
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
}

interface Settings {
    theme: 'light' | 'dark';
    volume: number;
    filters: {
        [key: string]: boolean;
    };
}
