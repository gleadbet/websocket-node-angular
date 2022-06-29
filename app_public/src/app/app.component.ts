import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  constructor(private socket: Socket) { }

  ngOnInit(): void {
    this.sendMessage({ text: 'Hi, I am Ife Jeremiah' })
    this.getMessage()
  }

  public sendMessage(msg: {}): void {
    setInterval(() => { this.socket.emit('message', msg); }, 100000)
  }

  public getMessage() {
    this.socket.on('data', (data: Event) => {
      console.log('Recieved event from server', data)
    })
  }

  public joinRoom(){
    // this.socket.on()
  }
}
