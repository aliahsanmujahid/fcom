import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { utlityService } from './utlity.service';
import { StorageService } from './storage.service';
import { DOCUMENT } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  public currentUserSource = new BehaviorSubject(null);
  currentUser$ = this.currentUserSource.asObservable();
  dataCache = new Map();
  constructor(
    private http: HttpClient,public utlityService: utlityService,
    public storageService: StorageService,
    private router: Router,@Inject(DOCUMENT) private document: Document
  ) {
  }
  autosignup(model: any) {
    return this.http.post(this.baseUrl + 'autosignup', model).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  sendotp(model) {
    return this.http.post(this.baseUrl + 'sendotp', model).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  otpsendagain(model) {
    return this.http.post(this.baseUrl + 'otpsendagain', model).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  async setUser(res) {
    const user = this.getDecodedToken(res?.jwt);
    await this.storageService.setItem('user',res?.jwt);
    this.currentUserSource.next(user);
    res?.msg ? this.utlityService.show(res?.msg) : '';
  }
  getCurrentUserValue() {
    return this.currentUserSource.value;
  }
  getDecodedToken(token) {
    return JSON.parse(atob(token?.split('.')[1]));
  }
  logout() {
    this.utlityService.scrollTop();
    this.storageService.removeItem('user');
    this.currentUserSource.next(null);
    this.utlityService.show("3/User loged out.");
    this.router.navigateByUrl('/login');
  }
  updateuser(model) {
    return this.http.post<any>(this.baseUrl + 'updateuser', model);
  }
  getbdaddress() {
    var response = this.dataCache.get("getbdaddress");
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getbdaddress/',{}).pipe(map(response => {
      this.dataCache.set("getbdaddress", response);
      return response;
    }));
  }
  getuserinfo(uid,save=true) {
    var response = this.dataCache.get("getuserinfo"+uid);
    if(response){
      return of(response);
    }
    return this.http.post<any>(this.baseUrl + 'getuserinfo/',{uid}).pipe(map(response => {
      save ? this.dataCache.set("getuserinfo"+uid, response) : '';
      return response;
    }));
  }
  async activeUpdate() {
    let visitorid:any = this.storageService.getItem('visitorid');
    if(!visitorid){
      visitorid = await this.generateUniqueId();
      this.storageService.setItem('visitorid',visitorid);
    }
    const payload = {
      visitorid: visitorid,
      user: this.currentUserSource.value
    };
    this.http.post<any>(this.baseUrl + 'activeupdate', payload).subscribe( res => {});
  }
  async generatevisitorid(){
    let visitorid:any = this.storageService.getItem('visitorid');
    if(!visitorid){
      visitorid = await this.generateUniqueId();
      this.storageService.setItem('visitorid',visitorid);
    }
    return visitorid;
  }
  async updateviews(pid) {
    let visitorid = this.generatevisitorid();
    const payload = {
      visitorid: visitorid,
      user: this.currentUserSource.value,
      pid:pid
    };
    this.http.post<any>(this.baseUrl + 'updateviews', payload).subscribe();
  }
  async setCheckedUser(set = false){
    let jwt = this.storageService.getItem('user');
    if(jwt){
      const user = this.getDecodedToken(jwt);
      this.http.post<any>(this.baseUrl + 'getuserinfo', {uid:user?.id || 0 }).subscribe( async res => {
        if(res) {
          if((res?.role !== user.role)){
            this.logout();
          }
          if(set){
           this.currentUserSource.next(res);
          }
        }else{
          this.logout();
        }
      });
    }
  }
  bdphonevalidation(n){
    if (n) {
      let isnum = /^\d+$/.test(n);
      if(!isnum) {
        this.utlityService.show("3/শুধু মোবাইল নম্বর প্রবেশ করুন।");
        return false;
      }
      if (n.length !== 11) {
        this.utlityService.show("3/একটি বৈধ মোবাইল নম্বর দিন।");
        return false;
      }
      var prefix = n.substring(0, 3);
      if (prefix != '013' && prefix != '014' && prefix != '015' && prefix != '016' && prefix != '017' && prefix != '018' && prefix != '019') {
        this.utlityService.show("3/একটি বৈধ মোবাইল নম্বর দিন।");
        return false;
      }
      return true;
    }
      this.utlityService.show("3/একটি বৈধ মোবাইল নম্বর দিন।");
      return false;
  }
  convertToShortNumber(num = 0) {
      if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
      }
      if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
      }
      if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
      }
      return num.toFixed(1).replace(/\.0$/, '');
  }
  monpurcheck(value: number | string): boolean {
    let str = String(value).toLowerCase();
    str = str.replace(/0/g, 'o');
    const cleaned = str.replace(/[^a-z\u0980-\u09FF]/g, '');
    const fuzzyEnglishVariants = ['monpur', 'monpor', 'monpo', 'monpore'];
    const fuzzyBanglaVariants = ['মনপুর', 'মনপোর', 'মনপু', 'মনপর'];
    if (
      fuzzyEnglishVariants.some(variant => cleaned.includes(variant)) ||
      fuzzyBanglaVariants.some(variant => cleaned.includes(variant))
    ) {
      this.utlityService.show("2/" + value + " name not allow.");
      return true;
    }
    return false;
  }
  getMinutesPassed(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return 'সময় এখনও আসেনি।';
    const diffMin = Math.floor(diffMs / 60000);
    return `${diffMin} মিনিট অতিক্রান্ত হয়েছে।`;
  }
  getDaysPassed(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return 'সময় এখনও আসেনি।';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} দিন অতিক্রান্ত হয়েছে।`;
  }
  timeAgoBangla(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((+now - +d) / 1000);

  if (seconds < 60) return 'এখনই';
  const intervals: { [key: string]: { sec: number, label: string } } = {
    year: { sec: 31536000, label: 'বছর' },
    month: { sec: 2592000, label: 'মাস' },
    week: { sec: 604800, label: 'সপ্তাহ' },
    day: { sec: 86400, label: 'দিন' },
    hour: { sec: 3600, label: 'ঘণ্টা' },
    minute: { sec: 60, label: 'মিনিট' }
  };

  for (const key in intervals) {
    const { sec, label } = intervals[key];
    const interval = Math.floor(seconds / sec);
    if (interval >= 1) {
      return `${interval} ${label} আগে`;
    }
  }
  return '';
}
  async openInNewTab(url){
    if(this.storageService.isBrowser) {
      const link = this.document.createElement('a');
      link.target = '_blank';
      link.href = url;
      await (link.click());
      this.utlityService.show("3/Enable popups.");
      link.remove();
    }
  }
  generateUniqueId(): string {
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    return randomPart + timestamp;
  }
  sorts = [
    { id:1,name: 'New', img:'assets/n.webp'},
    { id:2, name: 'Popular', img:'assets/po.webp'},
    { id:3, name: 'Offer', img:'assets/s.webp'},
    { id:4,name: 'Top', img:'assets/t.webp'},
    { id:5,name: 'Price Up', img:'assets/ph.webp'},
    { id:6, name: 'Price Low', img:'assets/l.webp'},
  ]
  usermenus = [
    { id:1,name: 'Profile',link:'/profile',hint:'ডেলিভারি ও ব্যক্তিগত তথ্য আপডেট করুন।'},
    { id:2, name: 'Orders',link:'/orders',hint:'পেমেন্ট ও প্রতিটি অর্ডারের বিস্তারিত তথ্য দেখুন।'},
    { id:3,name: 'Favorite',link:'/fav',hint:'আপনার পছন্দের প্রোডাক্টগুলো দেখুন।'},
    { id:4,name: 'Offers',link:'/offers',hint:'চলমান অফার দেখুন।'},
    { id:5,name: 'Shop',link:'/shop',hint:'আমাদের সব প্রোডাক্টগুলো দেখুন।'},
  ]
  genders = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  bodytypes = [
    { value: '', label: 'Select Size' },
    { value: 'avarage', label: 'Avarage' },
    { value: 'tall', label: 'Tall Height' },
    { value: 'big-belly', label: 'Big Belly' },
    { value: 'extra-large', label: 'Extra Large' }
  ];
  colors = ['#ef4747dc','#10ac2aba','rgb(244, 0, 143)'
            ,'rgb(255, 149, 0)','rgb(64, 0, 255)'];
}         