import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  baseUrl = environment.apiUrl;
  skip = environment.skip;
  dataCache = new Map();
  constructor(private http: HttpClient) { }
  getsitecontent() {
    var response = this.dataCache.get("getsitecontent");
    if(response){
      return of(response);
    }
    return  this.http.post<any>(this.baseUrl + 'getsitecontent/',{}).pipe(map(response => {
      this.dataCache.set("getsitecontent", response);
      return this.dataCache.get("getsitecontent");
    }));
  }
  getsitemanage() {
     var response = this.dataCache.get("getsitemanage");
    if(response){
      return of(response);
    }
    return  this.http.post<any>(this.baseUrl + 'getsitemanage/',{}).pipe(map(response => {
      this.dataCache.set("getsitemanage", response);
      return this.dataCache.get("getsitemanage");
    }));
  }
  getpages() {
    var response = this.dataCache.get("getpages");
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getpages/', {}).pipe(map(response => {
      this.dataCache.set("getpages", response);
      return this.dataCache.get("getpages");
    }));
  }
  getdelivery(){
    var response = this.dataCache.get("getdelivery");
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getdelivery/',{}).pipe(map(response => {
      this.dataCache.set("getdelivery", response);
      return this.dataCache.get("getdelivery");
    }));
  }
  getcategories() {
    var response = this.dataCache.get("getcategories");
    if(response){
      return of(response);
    }
    return this.http.post(this.baseUrl + 'getcategories/',{}).pipe(map(response => {
      this.dataCache.set("getcategories", response);
      return this.dataCache.get("getcategories");
    }));
  }
  
}
export class Shop {
    cateid: number;
    subcateid: number;
    sortby: number;
    page:number;
    userid:number;
    catename: string;
    subcatename: string;
    search: string;
    sortbyName: string;
    fav:any;
}
export class Want {
    sortby:any;
    showed:any;
    cateid:any;
}
export class Basket {
  totalqty: number = 0;
  subtotal: number = 0;
  total: number = 0;
  delivery: number = 0;
  address: Address;
  coupon:Coupon;
  products:Cart[] = [];
}
export class Address {
  name: string;
  phone: string;
  region: string;
  city: string;
  zone: string;
  address: string;
}
export interface Coupon {
  id: number;
  code: string;
  value: number;
  minimun: number;
}
export interface IBasketItem {
  eachid: string;
  id: number;
  name: string;
  price: number;
  sprice: number;
  quantity: number;
  img: string;
  sku: string;
  vari: Vari;
}
export class Cart {
  id: number;
  puid: number;
  eachid: string;
  cateid:number;
  subcateid:number;
  name:string;
  price:number;
  sprice:number;
  weight:number;
  quantity:number;
  sku:string;
  img:string;
  vari = new VariClass();
}
export class VariClass {
    id: number;
    name:string;
    values:Values[] = [];
}
  export interface Vari {
    id: number,
    name:string,
    values:Values[],
  }
  export interface Values {
      id: number,
      name:string;
      quantity: number;
      price: number;
      sku: string;
  }
  export class Review {
      id: number;
      reviwerid: number;
      pid: number;
      puid: string;
      oitemid: number;
      status: any;
      rating: any;
      review: any;
      image1: any;
      image2: any;
      image3: any;
  }




  