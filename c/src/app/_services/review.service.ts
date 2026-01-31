import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  baseUrl = environment.apiUrl;
  oskip = environment.oskip;
  dataCache = new Map();
  constructor(private http: HttpClient) { }
  createreview(model) {
    return this.http.post<any>(this.baseUrl + 'createreview/', model);
  }
  updatereview(model) {
    this.dataCache.set("getreview"+model.opid, null);
    return this.http.post<any>(this.baseUrl + 'updatereview/', model);
  }
  getallreviews(page,data) {
    return this.http.post<any>(this.baseUrl + 'getallreviews/',{id: data?.id, type: data?.type,page});
  }
  getreview(id) {
    var response = this.dataCache.get("getreview"+id);
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getreview/',{id:id}).pipe(map(response => {
      this.dataCache.set("getreview"+id, response);
      return this.dataCache.get("getreview"+id);
    }));
  }
}
