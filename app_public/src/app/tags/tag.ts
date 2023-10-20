//  Below is the return
// {{baseUrl}}/dataset/curdata?name=CAM-TS-01:MultiCoat.J1_TT_01 
//  
//  GET http://127.0.0.1:5001/api/dataset/curdata?name=CAM-TS-01:MultiCoat.J1_TT_01
// [
//   {
//       "periodicValues": [],
//       "_id": "64d28b5d01edda04d8aaf199",
//       "previousData": "64d2877901edda04d8aaf0c2",
//       "startTime": "2023-08-08T18:37:18.625Z",
//       "endTime": "2023-08-08T18:45:57.663Z",
//       "dataset": "64d1858101edda04d8aab88f",
//       "values": [
//           {
//               "time": "2023-08-08T18:45:57.663Z",
//               "value": 23.7056,
//               "qod": 192
//           }
//       ],
//       "valueCount": 491,
//       "index": 67,
//       "nextData": null
//   }
// ]

// I think the key is getting the tag info into the format below, from the get
export interface ITag{
    values: [{
      qod: any,
      time: any,
      value: any,
    }]
    Tagname: any
  }


// Create interface for the display
export interface IDTag{
  tagData: {
    time: string,
    value: number,
    qod: number
    Tagname: string
    displayName: string,
    units: string
  }
}

//  [
//   {
//     "Tagname": "CAM-TS-01:MultiCoat.Heartbeat",
//     "LatestRecord": {
//       "time": "2023-08-08T18:45:57.663Z",
//       "value": -32483,
//       "qod": 192
//     }
//   }
// ]
//

export interface IUPDTag{
  Tagname: string,
  LatestRecord:  
    { 
    time: any,
    value: any,
    qod: any
    }
}
