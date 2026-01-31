import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IProduct, Ivari, Product, Vari } from '../_models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  baseUrl = environment.apiUrl;
  productCache = new Map();

  constructor(private http: HttpClient) { }

  createupdateproduct(model: IProduct) {
    return this.http.post(this.baseUrl + 'createupdateproduct', {...model}).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  getEditProduct(uid) {
    return this.http.post<any>(this.baseUrl + 'geteditproduct/', {uid});
  }



  getproducts(params) {
    return this.http.post<Product[]>(this.baseUrl + 'getproducts/',params);
  }

  getvari(id){
    return this.http.post<Vari>(this.baseUrl + 'getvari/',{id:id});
  }


  getallproductslist(model) {
    return this.http.post<Product[]>(this.baseUrl + 'getallproductslist/',model);
  }
  deleteproduct(pid){
    return this.http.post<any>(this.baseUrl + 'deleteproduct/',{id:pid});
  }
  productactiveinactive(data){
    return this.http.post<any>(this.baseUrl + 'productactiveinactive/',data);
  }
  getmanagequestions(page: number,status:string,search:string){
    return this.http.post<any>(this.baseUrl + 'getmanagequestions/',{page,status,search});
  }
  getmanagebasket(page: number,status:string,search:string){
    return this.http.post<any>(this.baseUrl + 'getmanagebasket/',{page,status,search});
  }
  deletecart(id: number){
    return this.http.post<any>(this.baseUrl + 'deletecart/',{id});
  }
  createeditanswerquestion(model){
    return this.http.post<any>(this.baseUrl + 'createeditanswerquestion/',model);
  }
  loadmorequestions(model){
    return this.http.post<any>(this.baseUrl + 'loadmorequestions/',model);
  }
}
