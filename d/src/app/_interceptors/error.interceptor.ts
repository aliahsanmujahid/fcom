import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { utlityService } from '../_services/utlity.service';
import { AccountService } from '../_services/account.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, 
  private accountService: AccountService,
  private popup: utlityService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
              if (error.error.error) {
                this.popup.show(error.error.error);
              } else {
                this.popup.show(error.error);
              }
              break;
            case 401:
              this.popup.show('2/Something unexpected went wrong');
              break;
            case 404:
              this.popup.show('2/Something unexpected went wrong');
              break;
            case 500:
              this.popup.show('2/Something unexpected went wrong');
              this.accountService.logout();
              break;
            default:
              this.popup.show('2/Something unexpected went wrong');
              break;
          }
        }
        return throwError(error);
      })
    )
  }
}