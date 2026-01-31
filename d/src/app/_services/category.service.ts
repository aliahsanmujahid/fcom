import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  baseUrl = environment.apiUrl;
  skip = environment.skip;

  constructor(private http: HttpClient) { }


  createcate(model) {
    return this.http.post(this.baseUrl + 'createcate/', model);
  }

  deletecate(id) {
    return this.http.post<any>(this.baseUrl + 'deletecate/', {id:id});
  }
  deletesubcate(id) {
    return this.http.post<any>(this.baseUrl + 'deletesubcate/', {id:id});
  }

  createsubcate(model) {
    return this.http.post<any>(this.baseUrl + 'createsubcate/', model);
  }
  getsubcatebyid(id) {
    return this.http.post(this.baseUrl + 'getsubcatebyid/',{id:id});
  }

  getallcate() {
    return this.http.post(this.baseUrl + 'getallcate/',{});
  }




}
