import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  baseUrl = environment.apiUrl;
  skip = environment.skip;

  constructor(private http: HttpClient) { }


  createreview(model) {
    return this.http.post<any>(this.baseUrl + 'createreview/', model);
  }
  updatereview(model) {
    return this.http.post<any>(this.baseUrl + 'updatereview/', model);
  }

  getreview(id) {
    return this.http.post<any>(this.baseUrl + 'getreview/',{id:id});
  }



  rchangestatus(id,status) {
    return this.http.post<any>(this.baseUrl + 'rchangestatus', {id,status});
  }
  setallreviewstatust(data: any):Observable<any> {
    return this.http.post<any>(this.baseUrl + 'setallreviewstatust/',data);
  }

  getreviewsformanage(page: number,status:string,search:string) {
   return this.http.post<any[]>(this.baseUrl + 'getreviewsformanage',{page,status,search});
  }
  answerreview(model) {
    return this.http.post<any>(this.baseUrl + 'answerreview/',model);
  }

}
