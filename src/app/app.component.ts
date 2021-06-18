import { Component, Inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { MusicService } from './_services/music.service';
import { SettingsService } from './_services/settings.service';
import { SocketService } from './_services/socket.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
    connecting?: HTMLIonLoadingElement = undefined;
    constructor(
        private settings: SettingsService, 
        private socket: SocketService, 
        private loading: LoadingController,
        private music: MusicService,
    ) {

        if(!this.socket.connected) {
            this.loading.create({
                message: 'Reconnecting',
            }).then((toast) => {
                this.connecting = toast;
                this.connecting.present();
            })

            setTimeout(() => {
                if(this.socket.connected && this.connecting != undefined) {
                    this.connecting.dismiss();
                    this.connecting = undefined;
                }
            }, 1000)
        }

        this.socket.io.on('request-auth', () => {
            if(this.connecting != undefined) {
                this.connecting.dismiss();
                this.connecting = undefined;
            }
            let data: any = {
                admin: true
            }
            this.socket.io.emit('auth', data);
        });

        this.socket.io.on('disconnect', async () => {
            this.socket.connected = false;
            let data: any = {
                admin: true
            }
            
            this.connecting = await this.loading.create({
                message: 'Reconnecting',
            });
            this.connecting.present();
            setTimeout(() => {
                this.socket.io.emit('auth', data);
            }, 1000)
        });
    }
}
