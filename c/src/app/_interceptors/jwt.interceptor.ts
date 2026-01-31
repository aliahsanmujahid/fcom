import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: object) { }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (isPlatformBrowser(this.platformId)) {
      var token = JSON.parse(localStorage.getItem('user'));
      if(token){
        request = request.clone({
          setHeaders: {
            access_token: token,
          }
        })
      }
    }
    return next.handle(request);
  }
}
