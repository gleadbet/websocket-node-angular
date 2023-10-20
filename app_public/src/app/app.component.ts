import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tg-root',
  template: `
  <nav class='navbar navbar-expand navbar-light bg-light'>
      <a class='navbar-brand'>{{title}}</a>
      <ul class='nav nav-pills'>
        <li><a class='nav-link' routerLinkActive='active' routerLink='/welcome'>Home</a></li>
        <li><a class='nav-link' routerLinkActive='active' routerLink='/tags'>Tag List</a></li>
        <li><a class='nav-link' routerLinkActive='active' routerLink='/gage'>Tag Gage</a></li>
        <li><a class='nav-link' routerLinkActive='active' routerLink='/about'>About</a></li>
      </ul>
  </nav>
  <div class='container'>
    <router-outlet></router-outlet>
  </div>
  `,
  // Old code before routes -- embeded the page
  // `
  // <div><h1>{{title}}</h1>
  // <app-cur-tag-vals></app-cur-tag-vals>
  // </div>
  // `,
  // templateUrl: './app.component.html',
 styleUrls: ['./app.component.css']
})

// export interface Tile {
//   name: string;
//   friendlyName: string;
//   dbstatus: number;
//   mstatus: number;
//   type: string;
//   uuid: string;
//   location: string;
//   area: string;
//   value: any;
//   heartbeat: any;
// }

export class AppComponent implements OnInit {
  
  //DatePipe is a pipe that can be used to format dates and times
  constructor(private socket: Socket) { }

  //tiles: Tile[] = [];
  showChart = [];
  trendTag = "";
  heartBeat = 0;
  heartbeatTags = [];
  hbSub !: Subscription;
  title = 'cur-tag';

  ngOnInit(): void {

    // Test socket from app.componet.js first
    this.sendMessage({ text: 'ngOnInit(): Angular sending message from AppComponet:' });
    this.sendTime();
    this.getMessage()


  }   // End ngOnInit()


// The setInterval() method helps us to repeatedly execute a function after a fixed delay. 
// It returns a unique interval ID which can later be used by the clearInterval() method 
// which stops further repeated execution of the function.

  public sendMessage(msg: {}): void {
    setInterval(() => { this.socket.emit('message', msg); }, 100000)
  }

  sendTime() {
    this.sendMessage(new Date().toISOString());
  }


  // Message send from the server backend - displayed in the console or Webrowser
  public getMessage() {
    this.socket.on('data', (data: Event) => {
      console.log('Recieved event from server', data)
    })
  }


  public joinRoom(){
    // this.socket.on()
  }





}
