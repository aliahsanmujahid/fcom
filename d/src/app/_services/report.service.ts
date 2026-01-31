import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  baseUrl = environment.apiUrl;
  skip = environment.skip;

  constructor(private http: HttpClient) { };
  
  userreport(model) {
    return this.http.post<any>(this.baseUrl + 'userreport/', model);
  }
  productviewreport(model) {
    return this.http.post<any>(this.baseUrl + 'productviewreport/', model);
  }
  orderreport(model) {
    return this.http.post<any>(this.baseUrl + 'orderreport/', model);
  }

}
