import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() { }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    var token = JSON.parse(localStorage.getItem('user'));
    if(token){
      request = request.clone({
        setHeaders: {
          access_token: token,
        }
      })
    }
    return next.handle(request);
  }
}
