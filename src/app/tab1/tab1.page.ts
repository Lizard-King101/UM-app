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

    constructor(
        private socket: SocketService,
        public music: MusicService,
        private settings: SettingsService
    ) {
        this.socket.io.emit('get-room');
    }

    toggleLock() {
        this.music.locked = !this.music.locked;
    }

    volumeUpdate(ev) {
        this.settings.volume = ev.detail.value;
    }

    startNewRide() {
        this.socket.io.emit('new-ride');
    }
}