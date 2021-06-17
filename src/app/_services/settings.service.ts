import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

const DefaultSettings: Settings = {
    theme: 'light',
    volume: 30
}

@Injectable()
export class SettingsService {
    private settings: Settings;

    set theme(theme: 'light' | 'dark') {
        this.settings.theme = theme;
        this.setTheme(theme);
        this.saveSettings();
    }
    get theme(): 'light' | 'dark' {
        return this.settings.theme;
    }

    set volume(volume: number) {
        this.settings.volume = volume;
        this.saveSettings();
    }
    get volume(): number {
        return this.settings.volume;
    }

    constructor(@Inject(DOCUMENT) private document: Document) {
        this.settings = JSON.parse(localStorage.getItem('settings'));
        if(!this.settings) {
            this.settings = DefaultSettings;
        } else {
            this.theme = this.settings.theme;
        }
    }

    setTheme(theme: 'light' | 'dark') {
        if(theme == 'dark') {
            this.document.body.classList.add('dark');
        } else {
            this.document.body.classList.remove('dark');
        }
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
}

interface Settings {
    theme: 'light' | 'dark';
    volume: number
}