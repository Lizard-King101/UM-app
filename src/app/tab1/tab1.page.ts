import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { FiltersComponent } from '../filters/filters.component';
import { MusicService, Song } from '../_services/music.service';
import { SettingsService } from '../_services/settings.service';
import { SocketService } from '../_services/socket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
    private url = environment.socket;
    scrolled: boolean = false;

    constructor(
        private socket: SocketService,
        public music: MusicService,
        private settings: SettingsService,
        private http: HttpClient,
        private modal: ModalController
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

    toggleTag(tag: string, id?: string) {
        let song: Song;
        let tagArr: string[] = [];
        if(id) {
            const foundSong = this.music.findSong(id);
            if(foundSong) { song = foundSong; }
        } else if(this.music.song !== undefined) {
            song = this.music.song;
        }
        tagArr = [...song.tagArr];
        if(tagArr.length && tagArr.includes(tag)) {
            tagArr.splice(tagArr.indexOf(tag), 1);
        } else {
            tagArr.push(tag);
        }
        song.tagArr = tagArr;
        console.log(tagArr);

        this.http.post(this.url + 'set-tags', {
            tags: song.tagArr,
            video_id: song.video_id
        }).subscribe((result: any) => {
            if(!result.error) {
                song.tagArr = tagArr;
                song.tags = tagArr.join(',');
            }
        });
    }

    openFilters() {
        this.modal.create({
            component: FiltersComponent
        }).then((modal) => {
            modal.present();
        });
    }

    scroll(ev: any) {
        if(ev.detail.scrollTop <= 0) {
            this.scrolled = false;
        } else {
            this.scrolled = true;
        }
    }
}
