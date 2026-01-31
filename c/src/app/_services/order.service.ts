import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  baseUrl = environment.apiUrl;
  oskip = environment.oskip;
  filterorder = [];
  customerorderCache = new Map();
  dataCache = new Map();
  constructor(private http: HttpClient,private accountService: AccountService) { }
  createorder(basket) {
    return this.http.post<any>(this.baseUrl + 'createorder', {basket});
  }
  getcustomerorders(page: number) {
    return this.http.post<any[]>(this.baseUrl + 'getcustomerorders',{page:page});
  }
  ordercancel(data) {
    return this.http.post<any>(this.baseUrl + 'ordercancel',data);
  }
  paymentcreate(id) {
    return this.http.post<any>(this.baseUrl + 'paymentcreate',{orderid:id});
  }
  settxn(data) {
    return this.http.post<any>(this.baseUrl + 'settxn',data);
  }
  txnconfirm(data) {
    return this.http.post<any>(this.baseUrl + 'txnconfirm',data);
  }
  orderreturn(model) {
    return this.http.post<any>(this.baseUrl + 'orderreturn',model);
  }
  manageorderitemsreturn(id,todo){
    return this.http.post<any>(this.baseUrl + 'manageorderitemsreturn',{id,todo});
  }
}
