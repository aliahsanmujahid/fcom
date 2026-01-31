import { Component, OnInit } from '@angular/core';
import { utlityService } from 'src/app/_services/utlity.service';
import { SettingsService, Shop, Want } from 'src/app/_services/settings.service';
import { AccountService } from 'src/app/_services/account.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/_services/storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  popup$: Observable<boolean>;
  popuptxt$: Observable<string>;
  constructor(public settingsService: SettingsService,private sanitizer: DomSanitizer,
    public accountService: AccountService,public storageService:StorageService,
    public router: Router,public utlityService: utlityService) {
    }
  year = new Date().getFullYear();  
  user = null;
  params = new Shop();
  selectedCate = null;
  categoryes: any = [];
  pages = [];
  ngOnInit(): void {
    this.popup$  = this.utlityService.popup$;
    this.popuptxt$  = this.utlityService.popuptxt$;
    this.accountService.currentUser$.subscribe( user => {
      this.user = user;
    });
    this.utlityService.pagesource$.subscribe( pages => {
      this.pages = pages;
    });
    this.utlityService.params$.subscribe( res =>{
      if(res){
        this.params = res;
      }else{
        this.params = new Shop();
      }
    });
    this.getmenusfornav(); 
    this.utlityService.params$.subscribe( res =>{
      if(res){
       this.params = res;
      }else{
          this.params = new Shop();
      }
    });
    this.getsitecontent();
  }
  sidebar(){
    this.utlityService.showalert('sidebar',true);
  }
  profileclick(){
    if(this.user == null){
      this.router.navigateByUrl('/login');
    }else{
      this.utlityService.showalert('menu',true);
    }
  }
  sortby = 1;
  sorts = [
    { id:1,name: 'New Arrivale', },
    { id:2, name: 'Popular', },
    { id:3, name: 'Discount',  },
    { id:4,name: 'Top Rated', },
    { id:5,name: 'Price High', },
    { id:6, name: 'Price Low',}
  ]
  active
  async checkSelect(item){
    this.active = item.id;
    this.utlityService.hidealert()
    if(item.link == '/fav'){
      this.favClick();
    }else{
      this.router.navigate([item.link]);
    }
  }
  async sortSelect(item){
    if(item){
      this.params.sortby = item.id;
      this.params.sortbyName = item.name;
      if(item){
        var want = await this.storageService.getItem('want') || new Want();
        want.showed = 0;
        want.sortby = item?.id;
        this.storageService.setItem('want',want)
      }
      this.utlityService.setParams(this.params);
      this.utlityService.hidealert();
    }
  }
  async favClick(){
    if(!this.user){
      this.utlityService.show("3/Please login.");
      return;
    }
    this.params.fav = true;
    this.params.userid = this.user?.id;
    this.utlityService.setParams(this.params);
  }
    async cateclick(item,cate){
    if(cate == true){
        this.params.cateid =  item.id;
        this.params.catename =  item.name;
        this.params.subcateid =  null;
        this.params.subcatename =  null;
      }else{
      this.params.subcateid =  item.id;
      this.params.subcatename =  item.name;
      this.params.cateid =  null;
      this.params.catename =  null;
    }
    this.params.fav =  null;
    this.params.sortby = null;
    this.params.sortbyName = null;
    this.utlityService.setParams(this.params);
    this.utlityService.hidealert();
    this.utlityService.scrollTop();
  }
  getmenusfornav(){
    this.settingsService.getcategories().subscribe( res => {
      this.categoryes = res;
    })
  }
  gonewPage(page){
    this.router.navigate(['pages', page?.name]);
    this.utlityService.hidealert();
  }
  sitecontent = null;
  getsitecontent(){
    this.settingsService.getsitecontent().subscribe( res => {
      if(res){
        this.sitecontent = res;
      }
    });
  }
  getClass(txt){
    if(txt.split('/')[0] == 1){
      return 'flex items-center text-blue-800 border-t-4 border-blue-300 bg-blue-50 ';
    }
    if(txt.split('/')[0] == 2){
      return ' flex items-center text-red-800 border-t-4 border-red-300 bg-red-50  ';
    }
    if(txt.split('/')[0] == 3){
      return ' flex items-center text-emerald-800 border-t-4 border-emerald-300 bg-emerald-50 ';
    } 
    return ' flex items-center text-emerald-800 border-t-4 border-emerald-300 bg-emerald-50 ';
  }
}
