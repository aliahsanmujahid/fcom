import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AccountService } from './_services/account.service';
import { BasketService } from './_services/basket.service';
import { SettingsService, Shop, Want } from './_services/settings.service';
import { environment } from 'src/environments/environment';
import { utlityService } from 'src/app/_services/utlity.service';
import { StorageService } from './_services/storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  params = new Shop();
  constructor(public utlityService: utlityService,public storageService: StorageService,
  public settingsService: SettingsService,public accountService: AccountService,
  public router: Router,
  public basketService: BasketService) {}
  async ngOnInit() {
    this.basketService.getbasket();
    this.accountService.setCheckedUser(true);
    this.setfavicon();
    this.getcategories();
    this.getpages();
  }
  ngAfterViewInit(): void {
    if(this.storageService.isBrowser) {
      setTimeout(() => {
       this.accountService.activeUpdate();
      }, 10000);
    }
  }
  setcateparams(item,main){
   if(main){
      if(this.params.cateid != item?.id){
        this.params.cateid = item.id; 
        this.params.catename = item.name; 
        this.params.subcateid = null;
        this.params.subcatename = null;
      }else{
        this.params.cateid = null;
        this.params.catename = null;
        this.params.subcateid = null;
        this.params.subcatename = null;
      }
    }else{
       if(this.params.subcateid != item?.id){
        this.params.subcateid = item.id; 
        this.params.subcatename = item.name; 
        this.params.cateid = null;
        this.params.catename = null;
      }else{
        this.params.cateid = null;
        this.params.catename = null;
        this.params.subcateid = null;
        this.params.subcatename = null;
      }
    }
  this.params.fav = null;
  this.params.sortby = null;
  this.params.sortbyName = null;
  this.utlityService.setParams(this.params);
  this.utlityService.hidealert();
 }
  async checkSelect(item){
    if (this.params.sortby != item.id) {
      if(item){
         this.params.sortby = item.id;
         this.params.sortbyName = item.name;
         this.params.page = 0;
         this.params.fav = null;
         this.utlityService.setParams(this.params);
         if(item){
           var want = await this.storageService.getItem('want') || new Want();
           want.showed = 0;
           want.sortby = item?.id;
           await this.storageService.setItem('want',want);
         }
       }
    }else{
      this.params.sortby = null;
      this.params.sortbyName = null;
      this.params.page = 0;
      this.params.fav = null;
      this.utlityService.setParams(this.params);
    }
   }
category: any = [];
getcategories(){
  this.settingsService.getcategories().subscribe( res => {
    this.category = res;
  });
}
getpages() {
  this.settingsService.getpages().subscribe(res => {
    if (!res?.length) return;
    this.utlityService.setpagesource(res);
    const isRoot = this.router.url === '/' || this.router.url === '';
    if (isRoot) {
      const mainPage = res.find((p: any) => p.ismain == 1);
      if (mainPage) {
        this.router.navigate(['pages', mainPage.name]);
        this.utlityService.hidealert();
      }
    }
  });
}
setfavicon(){
  if(this.storageService.isBrowser) {
    var htmltitle: HTMLLinkElement = document?.querySelector('#htmltitle');
    htmltitle.textContent = document?.location?.hostname?.replace(/(^\w)/, c => c.toUpperCase());
    var favIcon: HTMLLinkElement = document?.querySelector('#favIcon');
    this.settingsService.getsitecontent().subscribe( async res => {
    const script = document?.createElement('script');
    const code = res?.scripts?.replace(/<\/?script>/g, '').trim();
    script.textContent = code;
    document.head.appendChild(script);
    if(res?.favicon && favIcon){
      (favIcon.href = res?.favicon);
      }
    });
  }
  }
}
