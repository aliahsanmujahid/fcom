import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../_models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  baseUrl = environment.apiUrl;
  skip = environment.skip;
  filterorder = [];


  customerorderCache = new Map();

  constructor(private http: HttpClient) { }

  deleteOrder(id: number) {
    return this.http.delete(this.baseUrl + 'orders/deleteOrder/' + id);
  }

  getorders(page: number,status:string,search:string) {
    return this.http.post<Order[]>(this.baseUrl + 'getorders',{page,status,search});
  }

  changestatus(id: number,status:string) {
    return this.http.post(this.baseUrl + '/changestatus',{id,status});
  }
  sendalltodelivery(data){
    return this.http.post<any>(this.baseUrl + 'sendalltodelivery',data);
  }
  txnconfirm(data) {
    return this.http.post<any>(this.baseUrl + 'txnconfirm',data);
  }
  changecutomerstatus(id: number,userid: number,status:string) {
    return this.http.put(this.baseUrl + 'orders/changecutomerstatus/' + id +'/' + userid +'/' +status,{});
  }

  setallorderstatus(data: any):Observable<any> {
    return this.http.post<any>(this.baseUrl + 'setallorderstatus/',data);
  }
  getorderforreturnmanage(page: number,status:string,search:string){
    return this.http.post<any>(this.baseUrl + 'getorderforreturnmanage/',{page,status,search});
  }
  manageorderitemsreturn(id,todo){
    return this.http.post<any>(this.baseUrl + 'manageorderitemsreturn/',{id,todo});
  }
}
