import { HttpClient } from '@angular/common/http';
import { ElementRef, Inject, Injectable, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, UserS } from '../_models/user';
import { utlityService } from './utlity.service';
import { StorageService } from './storage.service';
import { Product } from '../_models/product';
import { IOrderItem } from '../_models/order';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  dataCache = new Map();
  baseUrl = environment.apiUrl;
  public currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();
  constructor(public utlityService:utlityService,private http: HttpClient,
    public storageService: StorageService,private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private router: Router) { }
  
  createadminuser(model: UserS) {
    return this.http.post<any>(this.baseUrl + 'createadminuser', model);
  }
  getuserscountbyrole() {
    return this.http.post<any>(this.baseUrl + 'getuserscountbyrole', {});
  }
  searchuser(data) {
    return this.http.post<any>(this.baseUrl + 'searchuser', data);
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
  setadminmoderator(model) {
    return this.http.post<any>(this.baseUrl + 'setadminmoderator/',model);
  }
  async setUser(res){
    const user = this.getDecodedToken(res?.jwt);
    if(user?.role !== 'admin' && user?.role !== 'moderator'){
      this.utlityService.show("2/User Restricted.");
      return;
    }
    this.storageService.setItem('user',res?.jwt);
    this.currentUserSource.next(user);
  }
  getDecodedToken(token) {
    return JSON.parse(atob(token.split('.')[1]));
  }
  async logout() {
    this.storageService.removeItem('user');
    this.currentUserSource.next(null);
    await this.router.navigateByUrl('/');
    await (location.reload());
  }
  getuserinfo(model) {
    return this.http.post<any>(this.baseUrl + 'getuserinfo', model);
  }
  async setCheckedUser(set = false){
    let jwt = this.storageService.getItem('user');
    if(jwt){
      const user = this.getDecodedToken(jwt);
      this.http.post<any>(this.baseUrl + 'getuserinfo', {uid:user.id || 0}).subscribe( async res => {
        if(res) {
          if(res?.role !== user.role){
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
  resizeImage(file: File, maxWidth: number = 1250, maxHeight: number = 1550, quality: number = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Image resizing failed"));
            }
          }, file.type, quality);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
}

    export class Review {
      id: number;
      reviwerid: number;
      pid: number;
      oitemid: number;
      status: any;
      rating: any;
      review: any;
      answer: any;
      image1: any;
      image2: any;
      image3: any;
      customer:User;
      product:Product;
  }