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

    private playlist: Song[] = [];

    private webAudio: HTMLAudioElement;

    private _song?: Song;
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

    private _volLock: boolean = false;
    get locked() {
        return this._volLock;
    }

    set locked(lock: boolean) {
        this._volLock = lock;
        this.socket.io.emit('set-lock', lock);
    }

    private _volume: number = 30;
    get volume() {
        return this._volume;
    }

    set volume(vol: number) {
        this._volume = vol;
        this.socket.io.emit('volume', vol);
        this.setVolume(vol);
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
        this.url = environment.socket;
        this.volume = settings.volume;
        this.loadPlaylist();

        this.socket.io.on('status', (status: Status) => {
            if(status.emitter && status.emitter == this.socket.io.id) return;
            if(status.playing != this.playing) {
                this._playing = status.playing;
                if(status.playing) {
                    this.playSong(false);
                } else {
                    this.pauseSong(false);
                }
            }
        });

        this.socket.io.on('set-volume', (setVol: SetVolume) => {
            if(setVol.emitter && setVol.emitter == this.socket.io.id) return;
            if(setVol.locked != undefined) this._volLock = setVol.locked;
            this._volume = setVol.volume;

            this.setVolume(this.volume);
        })

        this.socket.io.on('requested-song', (song: Song) => {
            console.log('REQUESTED SONG', song);
            
            if(this.playing || this.song != undefined) {
                console.log('PLAYING OR SONG');
                
                for(let i = 0; i < this.playlist.length; i++) {
                    let s = this.playlist[i];
                    if(s.video_id == this.song.video_id) {
                        console.log('INSERT AT ' + (i + 1));
                        
                        this.playlist.splice(i + 1, 0, song);
                        if(!this.playing) this.startSong(song);
                        return;
                    }
                }
            } else {
                this.playlist.unshift(song);
                this.startSong(song);
            }
        })

        this.socket.io.on('play-next', () => {
            this.playNext()
        });

        this.socket.io.on('play-song', (song: Song) => {
            let found = false;
            for(let i = 0; i < this.playlist.length; i++) {
                let s = this.playlist[i];
                if(s.video_id == song.video_id) {
                    this.startSong(s);
                    found = true;
                    continue;
                }
            }
            if(!found) {
                if(this.song != undefined) {
                    for(let i = 0; i < this.playlist.length; i ++) {
                        let s = this.playlist[i];
                        if(s.video_id == this.song.video_id) {
                            this.playlist.splice(i + 1, 0, song);
                            return;
                        }
                    }
                } else {
                    this.playlist.unshift(song);
                    this.startSong(song);
                }
            }
        });

        this.socket.io.on('new-ride-start', () => {
            console.log(this.playlist);
        });

        this.socket.io.on('room-id', () => {
            if(!this.playlist.length) this.loadPlaylist();
        })

        this.socket.io.on('song-complete')

        this.socket.io.emit('get-volume');
    }

    loadPlaylist() {
        this.http.post(this.url + 'get-playlist', {}).subscribe((data: Song[]) => {
            console.log(data);
            this.playlist = data;
        });
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
        this.sendStatus();
    }

    playNext() {
        if(!this.song) {
            this.startSong(this.playlist[0])
        } else {
            for(let i = 0; i < this.playlist.length; i ++) {
                let song = this.playlist[i];
                if(song.video_id == this.song.video_id) {
                    if(this.playlist[i + 1]) {
                        this.startSong(this.playlist[i + 1]);
                    } else {
                        this.startSong(this.playlist[0]);
                    }
                    return;
                }
            }
        }
    }

    setVolume(volume?: number) {
        let vol = volume ? volume : this.settings.volume;
        if(this.mobile) {
            this.nativeAudio.setVolumeForComplexAsset(this.song.video_id, vol / 100);
        } else if (this.webAudio){
            this.webAudio.volume = vol / 100;
        }
    }

    playSong(send: boolean = true) {
        if(!this.song) {
            this.startSong(this.playlist[0]);
        } else {
            if(this.mobile) {
                this.nativeAudio.play(this.song.video_id);
            } else {
                this.webAudio.play();
            }
            this._playing = true;
            if(send) this.sendStatus()
        }
    }

    pauseSong(send: boolean = true) {
        if(this.mobile) {
            this.nativeAudio.stop(this.song.video_id);
        } else {
            this.webAudio.pause();
        }
        this._playing = false;
        if(send) this.sendStatus()
    }

    appendSong(song: Song) {
        this.playlist.push(song);
    }

    unloadSong() {
        if(this.mobile) this.nativeAudio.unload(this.song.video_id);
        else if(this.webAudio) this.webAudio.remove();
    }

    private startMobileSong() {
        this.nativeAudio.preloadComplex(this.song.video_id, this.url + 'music/' + this.song.video_id, this.settings.volume / 100, 1, 0).then(() => {
            this.nativeAudio.play(this.song.video_id);
            this.sendStatus();
        });
    }

    private startWebSong() {
        this.webAudio = this.document.createElement('audio');
        this.webAudio.addEventListener('loadeddata', () => {

            this.webAudio.play();
            this.sendStatus();
        });
        this.webAudio.addEventListener('ended', (ev) => {
            this.playNext();
        })
        this.webAudio.setAttribute('preload', 'auto')
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

interface SetVolume {
    volume: number;
    locked: boolean;
    emitter?: string;
}

interface Status {
    song?: Song;
    playing: boolean;
    emitter?: string;
}

export interface Song {
    id: number;
    video_id: string;
    title: string;
    artist: string;
    tags: string;
    client: boolean;
    added: Date;
    last_played: Date;
    requested?: boolean;
}