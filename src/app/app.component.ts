import { Component } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { LoadingController, Platform } from '@ionic/angular';
import { MusicService, Song } from './_services/music.service';
import { SettingsService } from './_services/settings.service';
import { SocketService } from './_services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
    connecting?: HTMLIonLoadingElement = undefined;
    notCounter: 0;

    constructor(
        private settings: SettingsService,
        private socket: SocketService,
        private loading: LoadingController,
        private music: MusicService,
        private platform: Platform,
    ) {

        this.platform.ready().then(() => {
            if(this.platform.is('capacitor')) {
                // this.backgroundMode.enable();
                // this.backgroundMode.on('activate').subscribe(() => {
                //     this.backgroundMode.disableWebViewOptimizations();
                // });
                // this.backgroundMode.overrideBackButton();

                LocalNotifications.addListener('localNotificationActionPerformed', () => {
                    this.notCounter++;
                    let notification: LocalNotificationSchema = {
                        id: this.notCounter,
                        title: `${this.socket.roomId}`,
                        body: '',
                        schedule: {
                            on: {second: 5},
                            count: 1
                        }
                    };
                    if(this.music.song !== undefined) {
                        notification.title += ` ${this.music.song.artist}`;
                        notification.body = `${this.music.song.title}`;
                        notification.attachments = [
                            {
                                id: this.music.song.video_id,
                                url: this.music.url + 'thumbnails/' + this.music.song.video_id + '.jpg'
                            }
                        ];
                    }
                    LocalNotifications.schedule({
                        notifications: [
                            notification
                        ]
                    });
                });

                this.music.on('new-room').subscribe((id: string) => {
                    this.notCounter++;
                    LocalNotifications.schedule({
                        notifications: [
                            {
                                id: this.notCounter,
                                title: `${this.socket.roomId}${this.socket.roomId !== '' ? ' Connected' : 'Need Room ID'}`,
                                body: ''
                            }
                        ]
                    });
                });

                this.music.on('play-song').subscribe(() => {
                    console.log('UPDATE PLAY');
                });

                this.music.on('pause-song').subscribe(() => {
                    console.log('UPDATE PAUSE');
                });

                this.music.on('start-song').subscribe((song: Song) => {
                    console.log('UPDATE SONG', song);
                    LocalNotifications.schedule({
                        notifications: [
                            {
                                id: 0,
                                title: `${this.socket.roomId} ${song.artist}`,
                                body: `${song.title}`,
                                attachments: [
                                    {
                                        id: song.video_id,
                                        url: this.music.url + 'thumbnails/' + song.video_id + '.jpg'
                                    }
                                ]
                            }
                        ]
                    });
                });
            }

            if(!this.socket.connected) {
                this.loading.create({
                    message: 'Reconnecting',
                }).then((toast) => {
                    this.connecting = toast;
                    this.connecting.present();
                });
                setTimeout(() => {
                    if(this.socket.connected && this.connecting !== undefined) {
                        this.connecting.dismiss();
                        this.connecting = undefined;
                    }
                }, 1000);
            }
        });


        this.socket.io.on('request-auth', () => {
            if(this.connecting !== undefined) {
                this.connecting.dismiss();
                this.connecting = undefined;
            }
            this.socket.io.emit('auth', {
                admin: true
            });
        });

        this.socket.io.on('disconnect', async () => {
            this.socket.connected = false;
            this.connecting = await this.loading.create({
                message: 'Reconnecting',
            });
            this.connecting.present();
            setTimeout(() => {
                this.socket.io.emit('auth', {
                    admin: true
                });
            }, 1000);
        });
    }
}
