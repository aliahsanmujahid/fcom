import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  baseUrl = environment.apiUrl;
  skip = environment.skip;

  constructor(private http: HttpClient) { }

  createcoupon(model) {
    return this.http.post<any>(this.baseUrl + 'createcoupon/', model);
  }

  updatecoupon(model) {
    return this.http.post<any>(this.baseUrl + 'updatecoupon/', model);
  }
  deletecopun(model) {
    return this.http.post<any>(this.baseUrl + 'deletecopun/', model);
  }

  getallcoupons(model) {
    return this.http.post<any>(this.baseUrl + 'getallcoupons/',model);
  }

  createsitemanage(model) {
    return this.http.post<any>(this.baseUrl + 'createsitemanage/', model);
  }
  updatesitemanage(model) {
    return this.http.post<any>(this.baseUrl + 'updatesitemanage/', model);
  }
  getsitecontent() {
    return this.http.post<any>(this.baseUrl + 'getsitecontent/', {});
  }
  
  createupdatesitecontent(model) {
    return this.http.post<any>(this.baseUrl + 'createupdatesitecontent/', model);
  }

  getsitemanage() {
    return this.http.post<any>(this.baseUrl + 'getsitemanage/',{});
  }

  createupdatedelivery(model) {
    return this.http.post<any>(this.baseUrl + 'createupdatedelivery/', model);
  }
  getdelivery() {
    return this.http.post<any>(this.baseUrl + 'getdelivery/', {});
  }

  getpages() {
    return this.http.post<any>(this.baseUrl + 'getpages/', {});
  }
  getallreport() {
    return this.http.post<any>(this.baseUrl + 'getallreport/',{});
  }
  getimagefile(type) {
    return this.http.post<any>(this.baseUrl + 'getimagefile/', {type:type});
  }
  createpage(data){
    return this.http.post<any>(this.baseUrl + 'createpage/', data);
  }
  deletepage(data){
    return this.http.post<any>(this.baseUrl + 'deletepage/', data);
  }
  pageaction(data){
    return this.http.post<any>(this.baseUrl + 'pageaction/', data);
  }
  imageupload(data){
    return this.http.post<any>(this.baseUrl + 'imageupload/', data);
  }
  deleteimage(data) {
    return this.http.post<any>(this.baseUrl + 'deleteimage/',data);
  }
}
