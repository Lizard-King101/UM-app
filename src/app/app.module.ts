import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MusicService } from './_services/music.service';
import { SearchService } from './_services/search.service';
import { SettingsService } from './_services/settings.service';
import { SocketService } from './_services/socket.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SocketService,
    SettingsService,
    SearchService,
    MusicService,
    StreamingMedia
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
