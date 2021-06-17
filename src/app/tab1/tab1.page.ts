import { Component } from '@angular/core';
import { MusicService } from '../_services/music.service';
import { SettingsService } from '../_services/settings.service';
import { SocketService } from '../_services/socket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
    volume: number;
    setVolume: number = 0;
    locked: boolean = false;

    constructor(
        private socket: SocketService,
        public music: MusicService,
        private settings: SettingsService
    ) {
        this.socket.io.emit('get-room');

        this.socket.io.on('set-volume', (setVol: SetVolume) => {
            if(setVol.emitter && setVol.emitter == this.socket.io.id) return;
            this.volume = this.setVolume = setVol.volume;
            this.music.setVolume(this.volume);
            this.locked = setVol.locked;
        })

        this.socket.io.emit('get-volume');
    }

    toggleLock() {
        this.locked = !this.locked;
        this.socket.io.emit('set-lock', this.locked);
    }

    volumeUpdate(ev) {
        this.setVolume = this.settings.volume = ev.detail.value;
        this.music.setVolume();
        this.socket.io.emit('volume', ev.detail.value);
    }
}

interface SetVolume {
    volume: number;
    locked: boolean;
    emitter?: string;
}