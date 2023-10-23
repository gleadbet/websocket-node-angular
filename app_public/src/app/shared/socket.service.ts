import { Injectable}  from '@angular/core';
import { Observable } from 'rxjs';
import { Socket  } from 'ngx-socket-io';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';

//const SERVER_URL = 'http://localhost:8080';
// 'http://127.0.0.1:5001/api
//   API_PROXY_URL:  '/api',  -- This is for the CORS issue - see readme
//   SOC_PROXY_URL:  '/soc',
//   SOC_LOCAL_URL:  'http://localhost:8080' -- will be blcoked by CORS 

const SERVER_URL = environment.SOC_PROXY_URL;
//const SERVER_URL = environment.API_LOCAL_URL
//const config: SocketIoConfig = { url: SERVER_URL, options: {
//} };

// This is a service that can be injected in other componets
@Injectable()
export class SocketService{

    // service variables to handle socket
    //private _socket;
    private  _socketurl:string=SERVER_URL;

    // Initalize private variables, setup socket
    constructor(private _socket: Socket) { }

    // constructor() {
    //     this._socketurl= SERVER_URL;
    //     // this._socket = io.connect(this._socketurl, { 
    //     //     reconnectionDelay: 5000,
    //     //     reconnection: true,
    //     //     reconnectionAttempts: 10,
    //     //     transports: ['polling'],
    //     //     agent: false, 
    //     //     upgrade: false,
    //     //     rejectUnauthorized: false
    //     //   });
    //     this._socket = io.connect(this._socketurl);
    //     if (this._socket.connected)
    //         console.log('socket.io is connected.')
    //     else
    //     console.log('socket.io is NOT connected.')

    // this._socketurl   vs  `http://localhost:8080`
    // setupSocketConnection() {
    //     this._socket = io.connect(this._socketurl, { 
    //       reconnectionDelay: 2000,
    //       reconnection: true,
    //       reconnectionAttempts: 10,
    //       transports: ['websocket'],
    //       agent: false, 
    //       upgrade: false,
    //       rejectUnauthorized: false
    //     });
    //   }

    public initSocket() {
        console.log("Connecting the socket to " + SERVER_URL);
        this._socket.connect();

        if (this._socket)
            console.log('socket.io is connected.')
        else
            console.log('socket.io is NOT connected.')
    }

    public getStatus() {
        console.log("Subscribing to status start!");
        this._socket.emit('status start');
    }

    public endStatus() {
        console.log("UnSubscribing to status! - heartbeat");
        this._socket.emit('status stop');
    }

    public endData() {
        this._socket.emit('tagdata stop');
    }

    public getData(tags: any[]){
        console.log(`tags: ${tags}`)
        this._socket.emit('tagdata', tags);
    }

    // Observable that can be used to display
    public OnData(): Observable<any> {
        return new Observable<any>(observer => {
            this._socket.on('recentdata', (data: any) => observer.next(data));
        })
    }

    public stopData() {
        this._socket.emit('tagdata stop');
    }

    // "data" is returned from the API
    public OnHeartBeats(): Observable<any> {
        return new Observable<any>(observer => {
            this._socket.on('heartbeats', (data: any) => observer.next(data));
        })
    }

    
    public closeSocket() {
        this._socket.disconnect();
        console.log("Disconnecting the socket...");
    }

}
