import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { IDTag, ITag } from './tag';                   // Interface used for tage
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-cur-tag-vals',                 // Must define this in the app module
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})

// Start with these tags (Descriptive Names)  ****
// •	MC_Inlet Temperature
// •	MC_MultCoat Heartbeat
// •	MC_Outlet Temperature
// •	AS4_Head Temperature
// •	ENV_Booth Ambient Temperature
// •	ENV_Booth Relative Humidity
// •	ABBSys_SystemClock – string variable – won’t show up on graph

// export interface ITag{
//   tagData: {
//     LatestRecord: {
//       time: any,
//       value: any,
//       qod: any
//     },
//     Tagname: any
//   }, 
//     tagInfo: {
//       displayName: any,
//       units: any
//     }
// }

// Develop class that gets info from tag values for Endpoint
export class TagListComponent implements OnInit, OnDestroy {

  public pageTitle = 'Latest Tag Values';
  // Define all the names of Tags we want to list, The long term use would be to get all tags, then filter
  // CAM-TS-01:ABB-Robot_rev2.RAPID.T_ROB1.DF_Variables.nDF_CycleTime
  // CAM-TS-01:MultiCoat.J1_TT_01  -- MC_Inlet Temperature
  // CAM-TS-01:MultiCoat.Heartbeat --  
  // CAM-TS-01:AccuraSpray4_headTemperature --  AS4_Head Temperature
  tagNames = ["CAM-TS-01:MultiCoat.J1_TT_01","CAM-TS-01:AccuraSpray4_headTemperature","CAM-TS-01:MultiCoat.Heartbeat"];

  tagulr="/dataset/curdata?name=";                  // Define api endpoint
  query="";
  errorMessage = 'Error with API';
  sub!: Subscription;

  tagvals:      ITag[]  = [];      // use interface to define tag from the post
  filteredTags: IDTag[] = [];      // If we only want to see a few tags
  
  // Initalize some tag info that will be displaying in the screen
  tagDisplay: IDTag[] = [
    { tagData:{time: "", value: 0, qod: 0, Tagname: "", displayName:"", units:"" } },
    { tagData:{time: "", value: 0, qod: 0, Tagname: "", displayName:"", units:"" } },
    { tagData:{time: "", value: 0, qod: 0, Tagname: "", displayName:"", units:"" } }  
  ]; 
  // format for easy display and test in the html doc


  // This is where you would inject a service, in our case the API, we need it below to call the backend
  constructor(private apiService: ApiService) { }

  // Filter the tags
  performFilter(filterBy: string): IDTag[] {
      // eliminate any case issues on the name to filter by
      filterBy = filterBy.toLocaleLowerCase();
      // use node built in array filter
      return this.tagDisplay.filter((tag: IDTag) =>
      
        // string function includes will return true if name exists
        //this.tagDisplay[0].tagData.displayName.toLocaleLowerCase().includes(filterBy));
       tag.tagData.displayName.toLocaleLowerCase().includes(filterBy));
      }


  // Created an Interface ITag defined in tag.ts to hold the complicated tag response
  // interface for the display
  // export interface IDTag{
  //   tagData: {
  //     time: string,
  //     value: number,
  //     qod: number
  //     Tagname: string
  //     displayName: string,
  //     units: string
  //   }
// }


  // USE GETTER - SETTER
  // Create a way to filter tages, vacume variable use undersore
  private _listFilter = '';

  // This would be based on the form input, for letter inputs, getter/setter on what we filter by
  // Getter - 
  get listFilter(): string {
    return this._listFilter;
  }

  // Setter - value assigned
  set listFilter(value: string) {
    this._listFilter = value;
    //console.log(`The filter value set is ${value}`);
    this.filteredTags = this.performFilter(value);
  }

  ngOnInit() {
    // Setup Filter - Assume Thermal spray for now.
    this.listFilter = "CAM-TS-01";

    // lets get the 3 tags we have defined
    for( let i=0; i <3; i++){

    // pass in tagname to query  
    this.query=this.tagNames[i];

    // call the backend API, for the tagname, in Angular you must subscribe
    this.sub = this.apiService.getTagData(this.tagulr, this.query)
    .subscribe({
      // get the result from the tag, put into the interface
      next: (tagvals: ITag[]) => {
        this.tagvals = tagvals;

        console.log(`TagValues ${JSON.stringify(this.tagvals,null,2)}`);

        // Setup and array of tag values to display that we got from the API
        this.tagDisplay[i].tagData.displayName=this.tagNames[i];
        this.tagDisplay[i].tagData.qod=tagvals[0].values[0].qod;
        this.tagDisplay[i].tagData.value=tagvals[0].values[0].value;
      },
      error: (err: string) => this.errorMessage = err
    });
  }
  }

    // Clean up subsription 
    ngOnDestroy(): void {
      this.sub.unsubscribe();

    }
    
  }

