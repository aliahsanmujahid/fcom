import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { Want } from './settings.service';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  baseUrl = environment.apiUrl;
  dataCache = new Map();
  productCache = new Map();
  filterorder = [];
  constructor(private http: HttpClient,public storageService:StorageService) { }
  skip = environment.skip;
  async getallproducts(params) {
    if(!params?.subcateid){
      var want = await this.storageService.getItem('want') || new Want();
      const randomNum = Math.floor(Math.random() * 6) + 1;
      if(params?.sortby == null || (!want?.sortby)){
        if(want?.showed < 1){
          want.showed = want?.showed + 1,
          want?.sortby ? params.sortby = want?.sortby : '';
        }else{
          want.showed = 0;
          want.sortby = randomNum;
          params.sortby = randomNum;
        }
      }else{
        params.sortby = params?.sortby;
      }
      if(!params?.cateid && !params?.subcateid){
        want?.cateid ? params.inmemory = want?.cateid : '';
      }
      await this.storageService.setItem('want',want);
    }
    return this.http.post<any[]>(this.baseUrl + 'getallproducts/',params).pipe(map(response => {
      if(!params?.fav){
        this.productCache.set('products',response);
      }
      return response;
    }))
  }
  getsingleproduct(id) {
    var response = this.dataCache.get("getsingleproduct"+id);
    if(response){
      return of(response);
    }
    return this.http.post(this.baseUrl + 'getsingleproduct/',{id:id}).pipe(map(response => {
      this.dataCache.set("getsingleproduct"+id, response);
      return this.dataCache.get("getsingleproduct"+id);
    }));
  }
  createeditanswerquestion(model){
    return this.http.post<any>(this.baseUrl + 'createeditanswerquestion/',model);
  }
  getrelatedproducts(cateid,subid,page){
    var response = this.dataCache.get("getrelatedproducts"+cateid+'-'+subid+'-'+page);
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getrelatedproducts/',{cateid,subid,page}).pipe(map(response => {
      this.dataCache.set("getrelatedproducts"+cateid+'-'+subid+'-'+page, response);
      return this.dataCache.get("getrelatedproducts"+cateid+'-'+subid+'-'+page);
    }));
  }
  getvari(id){
    var response = this.dataCache.get("getvari"+id);
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getvari/',{id:id}).pipe(map(response => {
      this.dataCache.set("getvari"+id, response);
      return this.dataCache.get("getvari"+id);
    }));
  }
  addremovefav(uid,pid){
    return this.http.post<any>(this.baseUrl + 'addremovefav',{uid,pid});
  }
  getproductquestions(uid,pid,page) {
    return this.http.post<any>(this.baseUrl + 'getproductquestions',{uid,pid,page});
  }
  getoffers(page,userphone = null) {
    return this.http.post<any>(this.baseUrl + 'getoffers',{page,userphone});
  }
  loadmoreoffer(id,page){
    return this.http.post<any>(this.baseUrl + 'loadmoreoffer',{id,page});
  }
}
