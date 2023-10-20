import { Component, OnInit, OnDestroy } from '@angular/core';  // Make sure we have life cycle 
import { IDTag, ITag, IUPDTag } from './tag';                           // Interface used for tage
import { ApiService } from '../shared/api.service';
import { SocketService } from '../shared/socket.service';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';

// Define as a componet, which will be identified in the app.componet
@Component({
  // selector: 'tg-tage-gage',    -- this will be part of routing ... not embeded
  templateUrl: './tag-gage.component.html',
  styleUrls: ['./tag-gage.component.css']
})


// Develop class that gets info from tag values for Endpoint
export class TagGageComponent implements OnInit, OnDestroy {
  
  pageTitle = 'Real Time Tag Gages';
  errorMessage = '';
  tag: ITag | undefined;
  hbSub: Subscription | undefined;    // subscribe to heartbeats, define variable
  heartbeatTags = [];

 //tagvals:  IUPDTag[]  = [];          // use interface to define tag from the post
 // Initalize before socket update          
 tagvals: IUPDTag[] = [
   {
   Tagname: "(tagname)",   
   LatestRecord:{time: "", value: 0, qod: 0 } }]

  // we we use sockets and the api to get data, we must create intectable
  constructor(private apiService: ApiService, private socket: SocketService) { }

  ngOnInit() {
    this.socket.initSocket();

    // Pull socket data from the service
    // hopefully the consturctor created the socket, let make sure 
    this.socket.getStatus();
    console.log("Initalize Gage componet " );

// Current tag data from pipeline ...
//   {
//     "Tagname": "CAM-TS-01:MultiCoat.Heartbeat",
//     "LatestRecord": {
//       "time": "2023-08-08T18:45:57.663Z",
//       "value": -32483,
//       "qod": 192
//     }
//   }
// ]

    this.hbSub = this.socket.OnHeartBeats()
    .subscribe((res: never[]) => {
      console.log(JSON.stringify(res, null,2));
      this.heartbeatTags = res;
      this.tagvals=res })                      // This line is magic .. data brought into interface

}


  // Clean up subsription 
  ngOnDestroy(): void {
    console.log("Destroy Gage componet " );

    this.socket.endStatus();
    this.socket.endData();
    // must test if it's possibly not subscribed yet ...
    if(this.hbSub)
      this.hbSub.unsubscribe();
    }

   


}
