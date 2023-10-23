import { Component, OnInit, OnDestroy } from '@angular/core';  // Make sure we have life cycle 
import { IDTag, ITag, IUPDTag } from './tag';                           // Interface used for tage
import { ApiService } from '../shared/api.service';
import { SocketService } from '../shared/socket.service';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';


export interface Tile {
  name: string;
  friendlyName: string;
  dbstatus: number;
  mstatus: number;
  type: string;
  uuid: string;
  location: string;
  area: string;
  value: any;
  heartbeat: any;
}


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

  tiles: Tile[] = [];
  showChart = [];
  trendTag = "";
  socketTags = [];


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
    // subscribe to heartbeat and start looking if data comes
    this.hbSub = this.socket.OnHeartBeats()
    .subscribe((res: never[]) => {
      console.log("heartBeats",JSON.stringify(res, null,2)); // Debug in console
      this.heartbeatTags = res;
      this.tagvals=res })                       // This line is magic .. data brought into interface


      this.updateSocket();                      // Look at all the tages

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
  
    // send the request for the tags specified
    updateSocket() {
        this.socket.stopData();
        var tagNames: string[] = ["CAM-TS-01:MultiCoat.J1_TT_01","CAM-TS-01:AccuraSpray4_headTemperature","CAM-TS-01:MultiCoat.Heartbeat"];

        var justTags: any[] = [];
        tagNames.forEach(j => { justTags.push(j);
        })

        // justTags[0] = "CAM-TS-01:MultiCoat.J1_TT_01";
        // justTags[1] = "CAM-TS-01:AccuraSpray4_headTemperature";
        // justTags[2] = "CAM-TS-01:MultiCoat.Heartbeat";

        this.socket.getData(justTags);


/*   
 ---  Below is the output result from the socket call to tagdata ( 3 tags specified )
tag-gage.component.ts:124 (updateSocket) Titles 
tag-gage.component.ts:78 heartBeats [
  {
    "Tagname": "CAM-TS-01:MultiCoat.Heartbeat",
    "LatestRecord": {
      "time": "2023-10-19T11:53:00.482Z",
      "value": 52,
      "qod": 192
    }
  }
]
3tag-gage.component.ts:117 tags [
  {
    "Tagname": "CAM-TS-01:MultiCoat.Heartbeat",
    "LatestRecord": {
      "time": "2023-10-19T11:53:00.482Z",
      "value": 52,
      "qod": 192
    }
  },
  {
    "Tagname": "CAM-TS-01:AccuraSpray4_headTemperature",
    "LatestRecord": {
      "time": "2023-08-08T18:46:05.029Z",
      "value": 41.686,
      "qod": 192
    }
  },
  {
    "Tagname": "CAM-TS-01:MultiCoat.J1_TT_01",
    "LatestRecord": {
      "time": "2023-08-08T18:45:57.663Z",
      "value": 23.7056,
      "qod": 192
    }
  }
]
*/

        this.socket.OnData()
        .subscribe(res => {
          res.forEach((tag: { Tagname: string | any[]; LatestRecord: { value: any; }; }) => {
            console.log("tags",JSON.stringify(res, null,2)); // Debug in console

            var index = this.tiles.findIndex(tile => tag.Tagname.includes(tile.name));
            if(index != -1){
              this.tiles[index].value = tag.LatestRecord.value;
            }
          })
          console.log(`(updateSocket) Titles ${this.tiles}`);
        })
        this.tiles = this.tiles.slice();
      }


}
