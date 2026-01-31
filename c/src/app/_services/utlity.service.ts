import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
import { Shop } from './settings.service';
@Injectable({
  providedIn: 'root'
})
export class utlityService {
  baseUrl = environment.apiUrl;
  //for alert close
  public alert = new BehaviorSubject<string>('');
  alert$ = this.alert.asObservable();

  public pagesourceSource = new BehaviorSubject<any>(null);
  pagesource$ = this.pagesourceSource.asObservable();

  //for alert close
  public reviewstoshow = new BehaviorSubject(null);
  reviewstoshow$ = this.reviewstoshow.asObservable();

  public popup = new ReplaySubject<boolean>(1);
  popup$ = this.popup.asObservable();
  public loader = new BehaviorSubject<boolean>(false);
  loader$ = this.loader.asObservable();
  public popuptxt = new ReplaySubject<string>(1);
  popuptxt$ = this.popuptxt.asObservable();
  // for params....
  public params = new BehaviorSubject<any>(null);
  params$ = this.params.asObservable();

  //menu active showing..
  public menuname = new BehaviorSubject<string>('');
  menuname$ = this.menuname.asObservable();
  constructor(@Inject(DOCUMENT) private document: Document,private http: HttpClient,private router: Router, private ngZone: NgZone,
    public storageService: StorageService,private viewportScroller: ViewportScroller
  ) { 
    this.popup.next(false);
    this.alert.next('');
    this.params.next(new Shop());
  };
  show(txt: any) {
    this.popup.next(true);
    this.popuptxt.next(txt);
    if(this.storageService.isBrowser) {
      setTimeout(()=>{
       this.popup.next(false);
       this.popuptxt.next('');
      }, 3000);
    }
  }
  showloader(show) {
   Promise.resolve().then(() => {
    this.loader.next(show);
   });
  }
  setmenuname(txt: any) {
    this.menuname.next(txt);
  }
  getmenuname() {
   return this.menuname.value;
  }
  setParams(params,navigate = true){
    for (const key in params){
      if (!params[key] || params[key] == null || params[key] == "null"){
        delete params[key];
      }
    }
    this.params.next(params);
    navigate ? params !== null ? this.router.navigate(['/shop',params])
       : this.router.navigate(['/shop']) : '';
  }
  //for alert close
  toggle = false;
  stopclose = false;
  showalert(name,toggle=false,stopclose = false) {
    if(this.stopclose){
      return;
    }
    if(stopclose){
      this.stopclose = true;
    }
    if(toggle){
      this.toggle = !this.toggle;
      if(this.toggle){
        this.alert.next(name);
      }else{
        this.alert.next('');
      }
    }else{
      this.alert.next('');
      this.alert.next(name);
    }
  }
  hidealert() {
    if(this.stopclose){
      return;
    }
    this.toggle = false;
    this.alert.next('');
  }
  setreviewfor(data) {
    this.reviewstoshow.next(data);
  }
  getreviewfor(){
    return this.reviewstoshow.value;
  }
  hidereviewalert(){
    this.toggle = false;
    this.stopclose = false;
    this.alert.next('');
  }
  getalert(){
    return this.alert.value;
  }
  scrollTop(){
    this.viewportScroller.scrollToPosition([0, 0]);
  }
  getSiteName(type = 1){
    if(this.storageService.isBrowser) {
     if(type == 1){
      return window.location.hostname;
     }else{
      return window.location.hostname.replace(/^www\./, '');
     }
    }
  }
  setpagesource(basket){
    this.pagesourceSource.next(basket);
  }
  getpagesource() {
    return this.pagesourceSource.value;
  }
}