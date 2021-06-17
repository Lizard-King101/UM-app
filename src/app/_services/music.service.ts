import { Inject, Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { SocketService } from "./socket.service";
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { environment } from "../../environments/environment";
import { DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { SettingsService } from "./settings.service";

@Injectable()
export class MusicService {
    public url: string;
    private mobile: boolean = false;
    public loadingSong: boolean = false;

     playlist: (Song|ClientList)[] = [];
     clientSongs: Song[] = [];

    private webAudio: HTMLAudioElement;

    private _song: Song;
    get song() {
        return this._song;
    }

    set song(song: Song) {
        this._song = song;
        this.sendStatus();
    }

    private _playing: boolean = false;
    get playing() {
        return this._playing;
    }
    set playing(stat: boolean) {
        this._playing = stat;
        this.sendStatus();
    }

    constructor(
        private platform: Platform, 
        private socket: SocketService, 
        private nativeAudio: NativeAudio,
        private settings: SettingsService,
        private http: HttpClient, 
        @Inject(DOCUMENT) private document: Document
    ) {
        this.mobile = this.platform.is('capacitor');
        this.url = environment.production ? 'https://api.multihosts.net/' : 'http://localhost:3000/';
        this.loadPlaylist();
    }

    loadPlaylist() {
        this.http.post(this.url + 'get-playlist', {}).subscribe((data: Song[]) => {
            console.log(data);
            this.playlist = data;
        })
    }

    togglePlaying() {
        if(this.playing) this.pauseSong();
        else this.playSong();
    }

    startSong(song: Song) {
        this.unloadSong();
        this.song = song;
        this.playing = true;
        if(this.mobile) this.startMobileSong();
        else this.startWebSong();
    }

    setVolume(volume?: number) {
        let vol = volume ? volume : this.settings.volume;
        if(this.mobile) {

        } else if (this.webAudio){
            this.webAudio.volume = vol / 100;
        }
    }

    playSong() {
        if(!this.song) {
            this.startSong(this.playlist[0].hasOwnProperty('clientlist') ? <Song>this.playlist[1] : <Song>this.playlist[0]);
        } else {
            if(this.mobile) {
                this.nativeAudio.play(this.song.video_id);
            } else {
                this.webAudio.play();
            }
            this.playing = true;
        }
    }

    pauseSong() {
        if(this.mobile) {
            this.nativeAudio.stop(this.song.video_id);
        } else {
            this.webAudio.pause();
        }
        this.playing = false;
    }

    unloadSong() {
        if(this.mobile) this.nativeAudio.unload(this.song.video_id);
        else if(this.webAudio) this.webAudio.remove();
    }

    private startMobileSong() {
        this.nativeAudio.preloadSimple(this.song.video_id, this.url + 'music/' + this.song.video_id).then(() => {
            this.nativeAudio.play(this.song.video_id);
        });
    }

    private startWebSong() {
        this.webAudio = this.document.createElement('audio');
        this.webAudio.addEventListener('loadeddata', () => {

            this.webAudio.play();
        });
        this.webAudio.volume = this.settings.volume / 100;
        this.document.body.appendChild(this.webAudio);
        this.webAudio.src = this.url + 'music/' + this.song.video_id;
    }

    sendStatus() {
        this.socket.io.emit('set-status', {
            song: this.song,
            playing: this.playing
        })
    }
}

interface Song {
    id: number;
    video_id: string;
    title: string;
    artist: string;
    tags: string;
    client: boolean;
    added: Date;
    last_played: Date;
}

interface ClientList {
    clientlist: boolean;
}