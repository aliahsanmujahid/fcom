import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService } from '../_services/account.service';
import { utlityService } from '../_services/utlity.service';

@Injectable({ providedIn: 'root' })
export class AllGuard implements CanActivate {

  constructor(
    private accountService: AccountService,
    private toastr: utlityService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles = route.data['roles'] || [];

    return this.accountService.currentUser$.pipe(
      map(user => {
        if (user && allowedRoles.includes(user.role)) {
          return true;
        }
        this.toastr.show('2/You cannot enter this area');
        return false;
      })
    );
  }
}
