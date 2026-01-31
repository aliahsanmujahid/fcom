import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { AccountService } from 'src/app/_services/account.service';
import { BasketService } from 'src/app/_services/basket.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { SettingsService, Shop } from 'src/app/_services/settings.service';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/_services/storage.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  navhovered = false;
  search:string = '';
  sitecontent = null;
  params:any= null;
  searchkeys: any[] = [];
  constructor(public utlityService: utlityService,public settingsService: SettingsService,
    public accountService: AccountService,
    public storageService: StorageService,
    private router: Router,public basketService: BasketService ) { }
  user = null;
  async ngOnInit(): Promise<void> {
    let keys: string[] = await this.storageService.getItem('searchkeys');
    if(keys){
      keys?.forEach( (value,index) =>{
        if(index < 10){
            this.searchkeys.push(value);
       }
    })};
    this.accountService.currentUser$.subscribe( user => {
      this.user = user;
    });
    this.utlityService.params$.subscribe( res =>{
      if(res){
       this.params = res;
      }else{
        this.params = new Shop();
      }
    });
  this.settingsService.getsitecontent().subscribe( async res => {
    if(res){
      this.sitecontent = res;
    }
  });
  }
  issearch = false;
 @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  searchClick(){
    this.issearch = true;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 50);
  }
  navpage:boolean = false;
  searchClick2(){
    this.utlityService.hidealert();
    this.navpage = false;
    this.issearch = false;
  }
  async searchProduct(){
    if (!this.search || this.search.trim().replace(/\s+/g, '') === '') return;
    this.params.search = this.search;
    this.params.fav = null;
    this.params.sortby = null;
    this.params.sortbyName = null;
    this.params.cateid = null;
    this.params.catename = null;
    this.params.subcateid = null;
    this.params.subcatename = null;
    this.params.page = 0;
    this.utlityService.hidealert();
    this.issearch = false;
    this.searchkey(this.search,true);
  }
   goCart(){
    var lk =false
    this.basketService.basket$.subscribe(res =>{
      if(res){
        lk = true;
      }
    });
    if(lk){
      this.params.fav = false;
      this.router.navigateByUrl('/cart');
    }else{
      this.utlityService.show('3/Basket is empty.');
    }
    this.utlityService.hidealert();
   }
   profileclick(){
    if(this.user == null){
      this.router.navigateByUrl('/login');
    }else{
      this.utlityService.showalert('menu',true);
    }
  }
   async setcateparams(item,main){
    if(main){
      this.params.cateid = item.id; 
      this.params.catename = item.name; 
      this.params.subcateid = null;
      this.params.subcatename = null;
    }else{
      this.params.subcateid = item.id; 
      this.params.subcatename = item.name; 
      this.params.cateid = null;
      this.params.catename = null;
    }
    this.params.fav = null;
    this.params.sortby = null;
    this.params.sortbyName = null;
    this.utlityService.setParams(this.params);
    this.utlityService.hidealert();
    this.navhovered = false;
   }
  async searchkey(key,search){
    let keys: string[] = await this.storageService.getItem('searchkeys');
    if(keys){
      let same = false
      await keys.forEach((element,index)=>{
        if(element.toLowerCase() == key.toLowerCase()){
          same = true;
        };
      });
      if(same == false){
        this.searchkeys.unshift(key);
        await this.storageService.setItem('searchkeys', this.searchkeys);
      }
    }else{
      this.searchkeys.push(key.replace(/\s+/g, ''));
      await this.storageService.setItem('searchkeys', this.searchkeys);
    }
    if(search){
      this.params.search = key;
      this.params.fav = null;
      this.params.sortby = null;
      this.params.sortbyName = null;
      this.params.cateid = null;
      this.params.catename = null;
      this.params.subcateid = null;
      this.params.subcatename = null;
      this.params.page = 0;
      this.utlityService.setParams(this.params);
      this.utlityService.hidealert();
      this.issearch = false;
    }
  }
  deletekey(item){
    this.searchkeys.forEach(async (element,index)=>{
      if(element.toLowerCase()==item.toLowerCase()){
        this.searchkeys.splice(index,1);
        if(this.params?.search?.toLowerCase() == item.toLowerCase()){
          this.params.search = null;
          this.utlityService.setParams(this.params);
          this.utlityService.hidealert();
        }
        await this.storageService.setItem('searchkeys', this.searchkeys);
      };
    });
  }
  searchHint(){
    this.utlityService.showalert('searchHint',false);
  }
  navshow(){
    this.navhovered = true;
    this.utlityService.hidealert();
  }
  onInputChange(event: any) {
    this.search = event.target.value;
  }
  
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
  async favClick(){
    if(!this.user){
      this.utlityService.show("3/Please login.");
      return;
    }
    this.params.fav = true;
    this.params.userid = this.user.id;
    this.utlityService.setParams(this.params);
  }
}
