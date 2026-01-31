import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class utlityService {
  baseUrl = environment.apiUrl;
  private livereportSource = new BehaviorSubject<any>(null);
  livereportSource$ = this.livereportSource.asObservable();
  public stopload = new BehaviorSubject<boolean>(false);
  stopload$ = this.stopload.asObservable();
  public scroll = new BehaviorSubject<boolean>(false);
  scroll$ = this.scroll.asObservable();
  public popup = new ReplaySubject<boolean>(1);
  popup$ = this.popup.asObservable();
  public popuptxt = new ReplaySubject<string>(1);
  popuptxt$ = this.popuptxt.asObservable();
  public loader = new ReplaySubject<boolean>(1);
  loader$ = this.loader.asObservable();
  //for alert close
  public alert = new BehaviorSubject<string>('');
  alert$ = this.alert.asObservable();
  // for params....
  public params = new BehaviorSubject<any>(null);
  params$ = this.params.asObservable();

  //menu active showing..
  public menuname = new BehaviorSubject<string>('');
  menuname$ = this.menuname.asObservable();
  constructor(@Inject(DOCUMENT) private document: Document,private http: HttpClient,private router: Router, private ngZone: NgZone,
    private viewportScroller: ViewportScroller
  ) { 
    this.popup.next(false);
    this.loader.next(false);
    this.scroll.next(false);
    this.alert.next('');
  };
  show(txt: any) {
    this.popup.next(true);
    this.popuptxt.next(txt);
    setTimeout(()=>{
       this.popup.next(false);
       this.popuptxt.next('');
    }, 3000);
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
  hideloader() {
    this.loader.next(false);
  }
  showloader(){
    if(!this.scroll.value){
      this.loader.next(true);
    }
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
  hidereviewalert(){
    this.toggle = false;
    this.stopclose = false;
    this.alert.next('');
  }
  getalert(){
    return this.alert.value;
  }
  //end for alert close
  startscroll() {
    this.scroll.next(true);
  }
  notscroll() {
    this.scroll.next(false);
  }
  scrollTop(){
    this.viewportScroller.scrollToPosition([0, 0]);
  }
  livereport(){
    this.http.post<any>(this.baseUrl + 'livereport/',{}).subscribe(res => {
      if(res){
        this.livereportSource.next(res);
      }
    })
  }

}