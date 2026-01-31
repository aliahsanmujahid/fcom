import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Injectable({ providedIn: 'root' })
export class StorageService {
 public isBrowser: boolean;
 constructor(@Inject(PLATFORM_ID) private platformId: object) {
   this.isBrowser = isPlatformBrowser(this.platformId);
 }
 setItem(key: string, value: any) {
   if (this.isBrowser) {
    try{
      localStorage.setItem(key, JSON.stringify(value));
    }catch(e){
      localStorage.removeItem(key);
    }
   }
  }
 getItem(key: string): Promise<any | null> {
   if (this.isBrowser) {
    try{
      return JSON.parse(localStorage.getItem(key));
    }catch(e){
      localStorage.removeItem(key);
    }
   }
  }
 removeItem(key: string) {
   if (this.isBrowser) {
    try{
      localStorage.removeItem(key);
    }catch(e){
      localStorage.removeItem(key);
    }
   }
  }
}