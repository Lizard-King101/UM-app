import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import io from 'socket.io-client';

@Injectable()
export class SocketService {
    connected: boolean = false;

    public io;
    public roomId = '';

    constructor(){
        this.io = io(environment.socket);
        console.log(environment);
        
        this.io.on('room-id', (id: string) => {
            this.roomId = id.toUpperCase();
        });

        this.io.on('new-ride-start', (id: string) => {
            this.roomId = id.toUpperCase();
        });
    }

}

export interface Connection {
    client_auth: boolean;
    message?: string;
    room?: string;
}