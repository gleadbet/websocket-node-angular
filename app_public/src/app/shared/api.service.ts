import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";                           // Allow this service to be injectable into other modules
import { Observable, catchError, tap, throwError, map } from "rxjs";
import { environment } from '../environments/environment';
import { ITag } from "../tags/tag";

@Injectable({
  providedIn: 'root'
})

// GET http://127.0.0.1:5001/api/dataset/curdata?name=CAM-TS-01:MultiCoat.J1_TT_01
export class ApiService {                             // API_LOCAL_URL: 'http://127.0.0.1:5001/api'  
    private baseUrl = environment.API_LOCAL_URL;      // depending on the enviornment, setup the url (prod/dev/local)
    //private url="";
    //public query=""; 

    constructor(private http: HttpClient) { }

    // Call the service, this is the backend call -- see the above url
    getTagData(url:string, query:string): Observable<ITag[]> {
    return this.http.get<ITag[]>(this.baseUrl+url+query)
      .pipe(
        tap(data => console.log('TagValues: ', JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // Get one product
  // Since we are working with a json file, we can only retrieve all products
  // So retrieve all products and then find the one we want using 'map'
  // getTag(id: number): Observable<ITag | undefined> {
  //   return this.getTag()
  //     .pipe(
  //       map((tag: IProduct[]) => products.find(p => p.productId === id))
  //     );
  // }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }

}

