import { Injectable } from '@angular/core';
import { utlityService } from 'src/app/_services/utlity.service';
@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busyRequestCount = 0;
  constructor(public utlityService: utlityService) { }
  busy() {
    this.busyRequestCount++;
    this.utlityService.showloader();
  }
  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.utlityService.hideloader();
    }
  }
}
