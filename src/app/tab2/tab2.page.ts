import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SearchService } from '../_services/search.service';
import { SocketService } from '../_services/socket.service';
import { MusicService, Song } from '../_services/music.service';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    query: string;
    pastQuery: string;
    searching: boolean = false;
    results: any[] = [];
    nextPageToken: string;
    constructor(private yt: SearchService, private socket: SocketService, public toastController: ToastController, private music: MusicService) {
        socket.io.on('song-progress', (data: {id: string, percent?: number}) => {
            this.results.forEach((result) => {
                if(result.id.videoId == data.id) {
                    result.adding = true;
                    if(data.percent) result.percent = data.percent;
                }
            })
        });

        socket.io.on('song-error', (data: {id: string, message: string, error: string, details: any}) => {
            console.log('FFMPEG ERROR: ', data.error, data.details);
            
            this.toastController.create({
                message: data.message,
                duration: 2000,
                buttons: ['OK']
            }).then((toast) => {toast.present()});
            this.results.forEach((result) => {
                if(result.id.videoId == data.id) {
                    result.adding = false;
                }
            })
        });

        socket.io.on('song-downloaded', (song: Song) => {
            this.music.appendSong(song);
            this.results.forEach((result) => {
                if(result.id.videoId == song.video_id) {
                    result.adding = false;
                    result.complete = true;
                }
            });
        })
    }

    submitSearch() {
        this.searching = true;
        this.pastQuery = this.query;
        this.results = [];
        this.yt.search(this.query).subscribe((data) => {
            this.searching = false;
            console.log(data);
            this.results = data.items;
            this.nextPageToken = data.nextPageToken ? data.nextPageToken : undefined;
        })
    }

    loadMore() {
        this.searching = true;
        this.yt.nextPage(this.pastQuery, this.nextPageToken).subscribe((data) => {
            this.searching = false;
            console.log(data);
            
            this.results = this.results.concat(data.items);
            this.nextPageToken = data.nextPageToken ? data.nextPageToken : undefined;
        })
    }

    onDownload(id: string) {
        console.log(id);
        this.socket.io.emit('download-song', id)
    }

}
